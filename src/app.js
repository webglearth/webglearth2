/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.App');

goog.require('goog.dom');

goog.require('weapi.Camera');
goog.require('weapi.DoubleEventAggr');
goog.require('weapi.NoRepeatTextureAtlas');
goog.require('weapi.maps');
goog.require('weapi.markers.MarkerManager');
goog.require('weapi.markers.PrettyMarker');



/**
 *
 * @param {string} divid .
 * @param {Object=} opt_options Application options.
 * @constructor
 */
weapi.App = function(divid, opt_options) {
  var options = opt_options || {};

  weapi.maps.initStatics(this);

  var container = goog.dom.getElement(divid);
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  this.canvas = /** @type {!HTMLCanvasElement} */
      (goog.dom.createElement('canvas'));
  this.canvas.style.width = '100%';
  this.canvas.style.height = '100%';
  this.canvas.oncontextmenu = function() {return false;};
  container.appendChild(this.canvas);

  /** @type {?Function} */
  this.afterFrameOnce = null;

  if (options['sky'] === false) {
    // preinit the context to have the right params in case of transparent bkg
    var tmpCtx = new Cesium.Context(this.canvas, {'alpha': true});
  }

  this.scene = new Cesium.Scene(this.canvas);

  /** @type {?weapi.MiniGlobe} */
  this.miniglobe = null;

  /** @type {boolean} */
  this.forcedPause = false;

  /** @type {boolean} */
  this.sceneChanged = true;

  // Debug stats for the rendering: (uncomment here and stats[_]++ below)
  //var stats = [0, 0];
  //setInterval(function() {
  //  window['console']['log']('rendered:', stats[0], 'ommited:', stats[1],
  //                           'rendered %:', stats[0] / (stats[0] + stats[1]));
  //}, 2000);

  /** @type {?Cesium.Matrix4} */
  this.lastViewMatrix = null;

  /** @type {?string} */
  var proxyHost = opt_options['proxyHost'] || null;

  /* type {{getURL: function(string) : string}} */
  this.mapProxyObject = {
    'getURL': function(url) {
      return proxyHost + encodeURIComponent(url);
    }
  };

  if (options['atmosphere'] !== false) {
    this.scene.skyAtmosphere = new Cesium.SkyAtmosphere();
  }
  if (options['sky'] !== false) {
    //TODO: solve resources
    var skyBoxBaseUrl = (goog.DEBUG ? '../deploy/' : '') + 'SkyBox/';
    this.scene.skyBox = new Cesium.SkyBox({
      'positiveX' : skyBoxBaseUrl + 'px.jpg',
      'negativeX' : skyBoxBaseUrl + 'mx.jpg',
      'positiveY' : skyBoxBaseUrl + 'py.jpg',
      'negativeY' : skyBoxBaseUrl + 'my.jpg',
      'positiveZ' : skyBoxBaseUrl + 'pz.jpg',
      'negativeZ' : skyBoxBaseUrl + 'mz.jpg'
    });
  } else {
    this.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0);
  }

  var primitives = this.scene.getPrimitives();

  // Bing Maps
  var bing = new Cesium.BingMapsImageryProvider({
    'url' : 'http://dev.virtualearth.net',
    'mapStyle' : Cesium.BingMapsStyle.AERIAL_WITH_LABELS
  });

  var ellipsoid = Cesium.Ellipsoid.WGS84;
  this.centralBody = new Cesium.CentralBody(ellipsoid);
  this.centralBody.getImageryLayers().addImageryProvider(bing);

  this.camera = new weapi.Camera(this.scene.getCamera(), ellipsoid);

  primitives.setCentralBody(this.centralBody);

  /**
   * @type {!weapi.markers.MarkerManager}
   */
  this.markerManager = new weapi.markers.MarkerManager(this, container);

  /**
   * @type {!Array.<!Cesium.CompositePrimitive>}
   */
  this.composites = [];

  /**
   * @type {!weapi.NoRepeatTextureAtlas}
   */
  this.polyIconAtlas = new weapi.NoRepeatTextureAtlas(this);

  /**
   * @type {!Cesium.BillboardCollection}
   */
  this.polyIconCollection = new Cesium.BillboardCollection();
  this.polyIconCollection.setTextureAtlas(this.polyIconAtlas.atlas);
  this.polyIconCollection.sizeReal = true;
  primitives.add(this.polyIconCollection);

  var tick = goog.bind(function() {
    if (!this.forcedPause) {
      this.scene.initializeFrame(); // to update camera from animators and sscc

      var renderNeeded = this.sceneChanged;
      this.sceneChanged = false;
      if (!renderNeeded) {
        // extended sceneChanged detection
        var viewMatrix = this.camera.camera.getViewMatrix();
        if (!this.lastViewMatrix || !this.lastViewMatrix.equals(viewMatrix)) {
          this.lastViewMatrix = viewMatrix;
          renderNeeded = true;
        }
      }
      if (renderNeeded) {
        //stats[0]++;
        this.scene.render();
        if (goog.isDefAndNotNull(this.miniglobe)) {
          this.miniglobe.draw();
        }
        this.markerManager.updateMarkers();
        if (goog.isDefAndNotNull(this.afterFrameOnce)) {
          this.afterFrameOnce();
          this.afterFrameOnce = null;
        }
      } else {
        //stats[1]++;
      }
    }
    Cesium.requestAnimationFrame(tick);
  }, this);
  tick();

  var handler = new Cesium.ScreenSpaceEventHandler(this.canvas);

  var stopAnim = goog.bind(function() {this.camera.animator.cancel();}, this);

  handler.setInputAction(stopAnim, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  handler.setInputAction(stopAnim, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
  handler.setInputAction(stopAnim, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
  handler.setInputAction(stopAnim, Cesium.ScreenSpaceEventType.WHEEL);
  handler.setInputAction(stopAnim, Cesium.ScreenSpaceEventType.PINCH_START);

  window.addEventListener('resize', this.handleResize, false);
  this.handleResize();


  var pos = options['position'];
  var center = options['center'];
  if (goog.isDefAndNotNull(pos) && pos.length > 1) {
    this.camera.setPos(goog.math.toRadians(pos[0]),
                       goog.math.toRadians(pos[1]),
                       undefined);
  } else if (goog.isDefAndNotNull(center) && center.length > 1) {
    this.camera.setPos(goog.math.toRadians(center[0]),
                       goog.math.toRadians(center[1]),
                       undefined);
  }

  // TODO: zoom support
  var z = options['zoom'];
  if (goog.isDefAndNotNull(z)) window['console']['log']('zoom not supported');

  var alt = options['altitude'];
  if (goog.isDefAndNotNull(alt)) this.camera.setPos(undefined, undefined, alt);

  var sscc = this.scene.getScreenSpaceCameraController();

  if (options['panning'] === false) sscc.enableRotate = false;
  if (options['tilting'] === false) sscc.enableTilt = false; //TODO: fix axis
  if (options['zooming'] === false) sscc.enableZoom = false;

  sscc['_rotateHandler'] = new weapi.DoubleEventAggr(sscc['_rotateHandler'],
                                                     sscc['_lookHandler'],
                                                     true, true);
  sscc['_lookHandler'] = new Cesium.CameraEventAggregator(this.canvas,
      Cesium['CameraEventType']['LEFT_DRAG'],
      Cesium['KeyboardEventModifier']['ALT']);

  //sscc['_cameraController']['lookUp'] =
  //    function(a) {sscc['_cameraController']['lookDown'](a);};

  //HACK for color picking:
  // when Cesium creates texture from image, it discards original image.
  // It is however very unefficient to preform color picking on WebGLTexture.
  // Therefore, clone the image reference prior to creating the texture.
  var orig = Cesium['ImageryLayer'].prototype['_createTexture'];
  Cesium['ImageryLayer'].prototype['_createTexture'] = function(ctx, imgry) {
    imgry['__image__'] = imgry['image'];
    orig.call(this, ctx, imgry);
  };

  // + HACK for sceneChange detection after loading tiles:
  var that = this;
  var orig2 = Cesium['Tile'].prototype['processStateMachine'];
  Cesium['Tile'].prototype['processStateMachine'] = function(c, tp, ic) {
    /*if (this['isRenderable']) */that.sceneChanged = true;

    orig2.call(this, c, tp, ic);
  };
};


/**
 * @define {number} Maximum size of the group of primitives;.
 */
weapi.App.PRIMITIVE_GROUPING_SIZE = 10;


/**
 * @param {!Cesium.BillboardCollection|!Cesium.CompositePrimitive|
 *         !Cesium.Polygon|!Cesium.PolylineCollection} object .
 */
weapi.App.prototype.addPrimitive = function(object) {
  var composite = goog.array.findRight(this.composites, function(el, i, arr) {
    return el['getLength']() < weapi.App.PRIMITIVE_GROUPING_SIZE;
  });

  if (!composite) {
    composite = new Cesium.CompositePrimitive();
    this.composites.push(composite);
    var primitives = this.scene.getPrimitives();
    primitives.add(composite);
    primitives.raiseToTop(this.polyIconCollection);
  }

  composite.add(object);
};


/**
 * @param {!Cesium.BillboardCollection|!Cesium.CompositePrimitive|
 *         !Cesium.Polygon|!Cesium.PolylineCollection} object .
 */
weapi.App.prototype.removePrimitive = function(object) {
  goog.array.forEach(this.composites, function(el, i, arr) {
    el['remove'](object);
  });
};


/**
 *
 */
weapi.App.prototype.handleResize = function() {
  var width = this.canvas.clientWidth;
  var height = this.canvas.clientHeight;

  if (this.canvas.width === width && this.canvas.height === height) {
    return;
  }

  this.canvas.width = width;
  this.canvas.height = height;
  this.scene.getCamera().frustum.aspectRatio = width / height;

  this.sceneChanged = true;
};


/**
 * @param {!weapi.Map} map Map.
 */
weapi.App.prototype.setBaseMap = function(map) {
  var layers = this.centralBody.getImageryLayers();
  //this.centralBody.getImageryLayers().get(0) = map.layer;
  layers.remove(layers.get(0), false);
  layers.add(map.layer, 0);

  this.sceneChanged = true;
};


/**
 * @param {weapi.Map} map Map.
 */
weapi.App.prototype.setOverlayMap = function(map) {
  var length = this.centralBody.getImageryLayers().getLength();
  var layers = this.centralBody.getImageryLayers();
  if (length > 1) {
    layers.remove(layers.get(1), false);
  }
  if (goog.isDefAndNotNull(map)) {
    layers.add(map.layer);
  }

  this.sceneChanged = true;
};


/**
 * Register event listener.
 * @param {string} type Event type.
 * @param {function(Event)} listener Function to call back.
 * @return {number?} listenKey.
 */
weapi.App.prototype.on = function(type, listener) {
  /**
   * Wraps the listener function with a wrapper function
   * that adds some extended event info.
   * @param {!weapi.App} app .
   * @param {function(Event)} listener Original listener function.
   * @return {function(Event)} Wrapper listener.
   * @private
   */
  var wrap = function(app, listener) {
    return function(e) {
      e.target = app;
      e['latitude'] = null;
      e['longitude'] = null;

      var cartesian = app.camera.camera.controller.
          pickEllipsoid(new Cesium.Cartesian2(e.offsetX, e.offsetY));
      if (goog.isDefAndNotNull(cartesian)) {
        var carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);

        e['latitude'] = goog.math.toDegrees(carto.latitude);
        e['longitude'] = goog.math.toDegrees(carto.longitude);
        e['altitude'] = carto.height;
      }

      listener(e);
    };
  };
  var key = goog.events.listen(this.canvas, type, wrap(this, listener));

  listener[goog.getUid(this) + '___eventKey_' + type] = key;

  return key;
};


/**
 * Unregister event listener.
 * @param {string|number|null} typeOrKey Event type or listenKey.
 * @param {function(Event)} listener Function that was used to register.
 */
weapi.App.prototype.off = function(typeOrKey, listener) {
  if (goog.isDefAndNotNull(listener)) {
    var key = listener[goog.getUid(this) + '___eventKey_' + typeOrKey];
    if (goog.isDefAndNotNull(key)) goog.events.unlistenByKey(key);
  } else if (!goog.isString(typeOrKey)) {
    goog.events.unlistenByKey(typeOrKey);
  }
};


/**
 * Unregister all event listeners of certain type.
 * @param {string} type Event type.
 */
weapi.App.prototype.offAll = function(type) {
  goog.events.removeAll(this.canvas, type);
};


/**
 * @param {number} lat Latitude.
 * @param {number} lon Longitude.
 * @param {string=} opt_iconUrl URL of the icon to use instead of the default.
 * @param {number=} opt_width Width of the icon.
 * @param {number=} opt_height Height of the icon.
 * @return {!weapi.markers.PrettyMarker} New marker.
 */
weapi.App.prototype.initMarker = function(lat, lon,
                                          opt_iconUrl, opt_width, opt_height) {
  var mark = new weapi.markers.PrettyMarker(goog.math.toRadians(lat),
                                            goog.math.toRadians(lon),
                                            opt_iconUrl, opt_width, opt_height);

  this.markerManager.addMarker(null, mark);

  this.sceneChanged = true;

  return mark;
};


/**
 * @param {!weapi.markers.PrettyMarker} marker .
 */
weapi.App.prototype.removeMarker = function(marker) {
  this.markerManager.removeMarkerEx(marker);

  this.sceneChanged = true;
};


/**
 * @param {number} lat Latitude in radians.
 * @param {number} lng Longitude in radians.
 * @return {Array.<number>} Pixel data
 *                          [r 0-255, g 0-255, b 0-255, a 0-1, zoomLevel].
 */
weapi.App.prototype.getBestAvailablePixelColorFromLayer = function(lat, lng) {
  var layer = this.centralBody.getImageryLayers().get(0);
  var provider = layer.getImageryProvider();
  var scheme = provider.getTilingScheme();
  var position = new Cesium.Cartographic(lng, lat);

  var result = null;
  var zoom = provider.getMaximumLevel();

  while (zoom >= 0) {
    var tileXY = scheme['positionToTileXY'](position, zoom);
    var imagery = layer['getImageryFromCache'](tileXY.x, tileXY.y,
                                               zoom, undefined);
    if (imagery['__image__']) {
      var pixelX = Math.floor((tileXY.x - Math.floor(tileXY.x)) *
                   provider.getTileWidth());
      var pixelY = Math.floor((tileXY.y - Math.floor(tileXY.y)) *
                   provider.getTileHeight());

      var canvas = goog.dom.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      var context = canvas.getContext('2d');
      context.drawImage(imagery['__image__'], pixelX, pixelY, 1, 1, 0, 0, 1, 1);

      var data = context.getImageData(0, 0, 1, 1).data;

      result = [data[0], data[1], data[2], data[3] / 255, zoom];
    }
    imagery['releaseReference']();

    if (result) return result;

    zoom--;
  }

  return [0, 0, 0, 0, -1];
};
