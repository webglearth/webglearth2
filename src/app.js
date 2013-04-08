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

  this.scene = new Cesium.Scene(this.canvas);

  /** @type {?weapi.MiniGlobe} */
  this.miniglobe = null;

  /** @type {boolean} */
  this.forcedPause = false;

  /** @type {?string} */
  var proxyHost = opt_options['proxyHost'] || null;

  /* type {{getURL: function(string) : string}} */
  this.mapProxyObject = {
    'getURL': function(url) {
      return proxyHost + url;
    }
  };

  if (options['atmosphere'] !== false) {
    this.scene.skyAtmosphere = new Cesium.SkyAtmosphere();

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
    //TODO: transparent color ?
  }

  var primitives = this.scene.getPrimitives();

  // Bing Maps
  var bing = new Cesium.BingMapsImageryProvider({
    'url' : 'http://dev.virtualearth.net',
    'mapStyle' : Cesium.BingMapsStyle.AERIAL_WITH_LABELS,
    // Some versions of Safari support WebGL, but don't correctly implement
    // cross-origin image loading, so we need to load Bing imagery using a proxy
    proxy: Cesium.FeatureDetection.supportsCrossOriginImagery() ?
        undefined : new Cesium.DefaultProxy('/proxy/')
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

  var tick = goog.bind(function() {
    if (!this.forcedPause) {
      this.scene.initializeFrame();
      this.scene.render();
      if (goog.isDefAndNotNull(this.miniglobe)) {
        this.miniglobe.draw();
      }
      this.markerManager.updateMarkers();

      if (goog.isDefAndNotNull(this.afterFrameOnce)) {
        this.afterFrameOnce();
        this.afterFrameOnce = null;
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
                                                     true, false);
  sscc['_lookHandler'] = new Cesium.CameraEventAggregator(this.canvas,
      Cesium['CameraEventType']['LEFT_DRAG'],
      Cesium['KeyboardEventModifier']['ALT']);

  //sscc['_cameraController']['lookUp'] =
  //    function(a) {sscc['_cameraController']['lookDown'](a);};
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
};


/**
 * @param {!weapi.Map} map Map.
 */
weapi.App.prototype.setBaseMap = function(map) {
  var layers = this.centralBody.getImageryLayers();
  //this.centralBody.getImageryLayers().get(0) = map.layer;
  layers.remove(layers.get(0), false);
  layers.add(map.layer, 0);
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

  return mark;
};


/**
 * @param {!weapi.markers.PrettyMarker} marker .
 */
weapi.App.prototype.removeMarker = function(marker) {
  this.markerManager.removeMarkerEx(marker);
};
