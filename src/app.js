/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.App');

goog.require('goog.dom');

goog.require('weapi.Camera');
goog.require('weapi.maps');
goog.require('weapi.markers.MarkerManager');
goog.require('weapi.markers.PrettyMarker');
goog.require('weapi.utils');


/**
 * @define {number} API version.
 */
weapi.VERSION = 2;


/**
 * @define {string} .
 */
weapi.UA = 'UA-20846306-1';



/**
 *
 * @param {string} divid .
 * @param {Object=} opt_options Application options.
 * @constructor
 */
weapi.App = function(divid, opt_options) {
  var options = opt_options || {};
  var container = goog.dom.getElement(divid);

  var webGLSupported = weapi.App.detectWebGLSupport();

  this.isFileProtocol = window.location.protocol == 'file:';
  this.resourceProtocol = this.isFileProtocol ? 'http:' : '';

  if (weapi.UA && weapi.UA.length > 0) {
    var trackerVar = '__WE_ga'; //global variable
    (function(i, s, o, g, r) {
      i['GoogleAnalyticsObject'] = r;
      i[r] = i[r] || function() {(i[r]['q'] = i[r]['q'] || []).push(arguments)};
      i[r]['l'] = 1 * new Date();
      var a = s.createElement(o), m = s.getElementsByTagName(o)[0];
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m);
    })(window, document, 'script',
       this.resourceProtocol + '//www.google-analytics.com/analytics.js',
       trackerVar);
    window[trackerVar]('create', weapi.UA, {'name': 'we0'});
    window[trackerVar]('we0.send', 'event', weapi.VERSION.toString(),
                       window.location.host, window.location.href,
                       webGLSupported ? 1 : 0);
  }

  if (!webGLSupported) {
    var ifr = goog.dom.createDom('iframe', {
      'src': this.resourceProtocol + '//www.webglearth.com/webgl-error.html'
    });
    ifr.style.width = '100%';
    ifr.style.height = '100%';
    ifr.style.border = 'none';
    container.appendChild(ifr);
    return;
  }

  weapi.utils.installStyles('.cesium-credit-textContainer:before{content:' +
                            '\'WebGL Earth \\2022\\20 Cesium \\2022\\20\';}');

  this.CORSErrorReported = false;
  weapi.maps.initStatics(this);

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

  this.scene = new Cesium.Scene({
    'canvas': this.canvas,
    'contextOptions': {'webgl': {'alpha': options['sky'] !== true}}
  });

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

  /** @type {!Cesium.Matrix4} */
  this.lastViewMatrix = new Cesium.Matrix4();

  /** @type {?string} */
  var proxyHost = options['proxyHost'] || null;

  /* type {{getURL: function(string) : string}} */
  this.mapProxyObject = {
    'getURL': function(url) {
      return goog.isDefAndNotNull(proxyHost) ?
             proxyHost + encodeURIComponent(url) : url;
    }
  };

  if (options['atmosphere']) {
    this.scene.skyAtmosphere = new Cesium.SkyAtmosphere();
  }
  if (options['sky']) {
    var baseUrl = goog.isString(options['sky']) ?
                  options['sky'] : window['CESIUM_BASE_URL'];
    var skyBoxBaseUrl = (goog.DEBUG ? '../deploy/' : baseUrl) + 'SkyBox/';
    this.scene.skyBox = new Cesium.SkyBox({
      'sources': {
        'positiveX' : skyBoxBaseUrl + 'px.jpg',
        'negativeX' : skyBoxBaseUrl + 'mx.jpg',
        'positiveY' : skyBoxBaseUrl + 'py.jpg',
        'negativeY' : skyBoxBaseUrl + 'my.jpg',
        'positiveZ' : skyBoxBaseUrl + 'pz.jpg',
        'negativeZ' : skyBoxBaseUrl + 'mz.jpg'
      }
    });
  } else {
    this.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0);
  }

  var primitives = this.scene.primitives;

  var ellipsoid = Cesium.Ellipsoid.WGS84;
  this.globe = new Cesium.Globe(ellipsoid);

  this.camera = new weapi.Camera(this.scene.camera, ellipsoid);

  this.scene.globe = this.globe;

  if (options['empty'] !== true) {
    // default layer -- OSM
    var secure = 'https:' == document.location.protocol;
    var protocol = (secure ? 'https:' : 'http:');

    var mq = new Cesium.OpenStreetMapImageryProvider({
      'url': protocol + '//a.tile.openstreetmap.org/'
    });
    this.scene.imageryLayers.addImageryProvider(mq);
  }
  this.withTerrain = !!options['terrain'];
  if (this.withTerrain) {
    var url = options['terrain'];
    if (url === true) {
      // for compatibility
      url = 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles';
    }
    var terrainProvider = new Cesium.CesiumTerrainProvider({
      'url': url,
      'credit': options['terrainCredit']
    });
    this.scene.terrainProvider = terrainProvider;
  }

  /**
   * @type {!weapi.markers.MarkerManager}
   */
  this.markerManager = new weapi.markers.MarkerManager(this, container);

  /**
   * @type {!Array.<!Cesium.PrimitiveCollection>}
   */
  this.composites = [];

  /**
   * @type {!Cesium.BillboardCollection}
   */
  this.polyIconCollection = new Cesium.BillboardCollection();
  primitives.add(this.polyIconCollection);

  var tick = goog.bind(function() {
    if (!this.forcedPause) {
      this.scene.initializeFrame(); // to update camera from animators and sscc

      // we need to use continous rendering with terrain --
      // we can't tell when the terrain data are finished loading and processing
      var renderNeeded = this.withTerrain || this.sceneChanged;
      this.sceneChanged = false;
      if (!renderNeeded) {
        // extended sceneChanged detection
        var viewMatrix = this.camera.camera.viewMatrix;
        if (!this.lastViewMatrix || !this.lastViewMatrix.equals(viewMatrix)) {
          viewMatrix.clone(this.lastViewMatrix);
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
  Cesium.requestAnimationFrame(tick);

  var handler = new Cesium.ScreenSpaceEventHandler(this.canvas);

  var stopAnim = goog.bind(function() {this.camera.animator.cancel();}, this);

  handler.setInputAction(stopAnim, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  handler.setInputAction(stopAnim, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
  handler.setInputAction(stopAnim, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
  handler.setInputAction(stopAnim, Cesium.ScreenSpaceEventType.WHEEL);
  handler.setInputAction(stopAnim, Cesium.ScreenSpaceEventType.PINCH_START);

  goog.events.listen(window, 'resize', this.handleResize, false, this);
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

  var sscc = this.scene.screenSpaceCameraController;

  if (options['unconstrainedRotation'] !== true) {
    this.scene.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;
  }

  //sscc.enableLook = false;
  if (options['panning'] === false || options['dragging'] === false)
    sscc.enableRotate = false;
  if (options['tilting'] === false)
    sscc.enableTilt = false; //TODO: fix axis
  if (options['zooming'] === false || options['scrollWheelZoom'] === false)
    sscc.enableZoom = false;

  sscc.minimumZoomDistance = options['minAltitude'] || 20;
  sscc.maximumZoomDistance = options['maxAltitude'] || Infinity;

  sscc['tiltEventTypes'].push({
    'eventType': Cesium['CameraEventType']['LEFT_DRAG'],
    'modifier': Cesium['KeyboardEventModifier']['SHIFT']
  });

  sscc['lookEventTypes'] = {
    'eventType': Cesium['CameraEventType']['LEFT_DRAG'],
    'modifier': Cesium['KeyboardEventModifier']['ALT']
  };

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
  var orig2 = Cesium['GlobeSurfaceTile']['processStateMachine'];
  Cesium['GlobeSurfaceTile']['processStateMachine'] =
      function(t, c, cl, tp, ic) {
    /*if (this['isRenderable']) */that.sceneChanged = true;

    orig2(t, c, cl, tp, ic);
  };

  setTimeout(function() {
    that.sceneChanged = true;
  }, 1);
};


/**
 * @define {number} Maximum size of the group of primitives;.
 */
weapi.App.PRIMITIVE_GROUPING_SIZE = 10;


/**
 * @param {HTMLCanvasElement=} opt_canvas
 * @param {Object=} opt_contextOpts
 * @return {?WebGLRenderingContext}
 */
weapi.App.detectWebGLSupport = function(opt_canvas, opt_contextOpts) {
  if (!!window['WebGLRenderingContext']) {
    var canvas = opt_canvas || goog.dom.createElement('canvas'),
        names = ['webgl', 'experimental-webgl']; //'moz-webgl', 'webkit-3d'
    for (var i = 0; i < names.length; i++) {
      try {
        var ctx = /** @type {?WebGLRenderingContext} */
            (canvas.getContext(names[i], opt_contextOpts));
        if (ctx && goog.isFunction(ctx['getParameter'])) return ctx;
      } catch (e) {}
    }
    return null; // supported but disabled
  }
  return null; //not supported
};


/**
 * @param {Object} eventObj
 */
weapi.App.prototype.listenCORSErrors = function(eventObj) {
  if (!this.CORSErrorReported) {
    eventObj['addEventListener'](function(e) {
      if (!this.CORSErrorReported) {
        //window['console']['log'](e);
        //if (e['timesRetried'] > 1) { // not an isolated network error
        if (this.isFileProtocol &&
            e['provider']['_url'].indexOf('http') !== 0) {
          alert('Tiles for WebGL must be accessed over http protocol.');
        } else {
          var msg = 'An error occured while accessing the tiles. Cross-domain' +
              ' access restrictions are applied on map tiles for WebGL. ' +
              'Either use CORS on remote domain (http://enable-cors.org/) or ' +
              'place your application on the same domain as tiles (hosting ' +
              'app and tiles on the same domain or running a tile proxy).';
          if (window['console'] && window['console']['error']) {
            window['console']['error'](msg);
          }
        }
        this.CORSErrorReported = true; // report only once
        //}
      }
    }, this);
  }
};


/**
 * @param {!Cesium.BillboardCollection|!Cesium.PrimitiveCollection|
 *         !Cesium.Polygon|!Cesium.PolylineCollection} object .
 */
weapi.App.prototype.addPrimitive = function(object) {
  var composite = goog.array.findRight(this.composites, function(el, i, arr) {
    return el.length < weapi.App.PRIMITIVE_GROUPING_SIZE;
  });

  if (!composite) {
    composite = new Cesium.PrimitiveCollection();
    this.composites.push(composite);
    var primitives = this.scene.primitives;
    primitives.add(composite);
    primitives.raiseToTop(this.polyIconCollection);
  }

  composite.add(object);
};


/**
 * @param {!Cesium.BillboardCollection|!Cesium.PrimitiveCollection|
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
  this.scene.camera.frustum.aspectRatio = width / height;

  this.sceneChanged = true;
};


/**
 * @param {!weapi.Map} map Map.
 */
weapi.App.prototype.setBaseMap = function(map) {
  var layers = this.scene.imageryLayers;
  //this.scene.imageryLayers.get(0) = map.layer;
  layers.remove(layers.get(0), false);
  layers.add(map.layer, 0);
  map.app = this;

  this.sceneChanged = true;
};


/**
 * @param {weapi.Map} map Map.
 */
weapi.App.prototype.setOverlayMap = function(map) {
  var length = this.scene.imageryLayers.length;
  var layers = this.scene.imageryLayers;
  if (length > 1) {
    layers.remove(layers.get(1), false);
  }
  if (goog.isDefAndNotNull(map)) {
    layers.add(map.layer);
    map.app = this;
  }

  this.sceneChanged = true;
};


/**
 * Register event listener.
 * @param {string} type Event type.
 * @param {function(Event)} listener Function to call back.
 * @return {goog.events.ListenableKey|null|number} listenKey.
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

      var offsetX = e.offsetX, offsetY = e.offsetY;
      if (!goog.isDefAndNotNull(offsetX) || !goog.isDefAndNotNull(offsetY)) {
        var origE = e.getBrowserEvent();
        var pageX = origE.pageX, pageY = origE.pageY,
            touches = origE['touches'];
        if (touches && touches[0] && (!pageX || !pageY)) {
          pageX = touches[0].pageX;
          pageY = touches[0].pageY;
        }
        var canvasOffset = goog.style.getPageOffset(app.canvas);
        offsetX = pageX - canvasOffset.x;
        offsetY = pageY - canvasOffset.y;
      }
      if (goog.isDefAndNotNull(offsetX) && goog.isDefAndNotNull(offsetY)) {
        var cartesian = app.camera.camera.
            pickEllipsoid(new Cesium.Cartesian2(offsetX, offsetY));
        if (goog.isDefAndNotNull(cartesian)) {
          var carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);

          var lat = goog.math.toDegrees(carto.latitude),
              lng = goog.math.toDegrees(carto.longitude);
          e['latlng'] = {'lat': lat, 'lng': lng};
          e['latitude'] = lat;
          e['longitude'] = lng;
          e['altitude'] = carto.height;
          e['originalEvent'] = e.getBrowserEvent();
        }
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
 * @param {number|!weapi.markers.AbstractMarker} latOrMark Latitude or marker.
 * @param {number} lon Longitude.
 * @param {string=} opt_iconUrl URL of the icon to use instead of the default.
 * @param {number=} opt_width Width of the icon.
 * @param {number=} opt_height Height of the icon.
 * @return {!weapi.markers.AbstractMarker} New marker.
 */
weapi.App.prototype.initMarker = function(latOrMark, lon,
                                          opt_iconUrl, opt_width, opt_height) {
  var mark;
  if (goog.isNumber(latOrMark)) {
    mark = new weapi.markers.PrettyMarker(goog.math.toRadians(latOrMark),
                                          goog.math.toRadians(lon),
                                          opt_iconUrl, opt_width, opt_height);
  } else {
    mark = latOrMark;
  }

  this.markerManager.addMarker(null, mark);

  this.sceneChanged = true;

  return mark;
};


/**
 * @param {!weapi.markers.AbstractMarker} marker .
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
  var layer = this.scene.imageryLayers.get(0);
  var provider = layer.imageryProvider;
  var scheme = provider.tilingScheme;
  var position = new Cesium.Cartographic(lng, lat);

  var result = null;
  var zoom = provider.maximumLevel;

  while (zoom >= 0) {
    var tileXY = scheme['positionToTileXY'](position, zoom);
    var imagery = layer['getImageryFromCache'](tileXY.x, tileXY.y,
                                               zoom, undefined);
    if (imagery['__image__']) {
      var pixelX = Math.floor((tileXY.x - Math.floor(tileXY.x)) *
                   provider.tileWidth);
      var pixelY = Math.floor((tileXY.y - Math.floor(tileXY.y)) *
                   provider.tileHeight);

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
