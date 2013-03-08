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



/**
 *
 * @param {string} divid .
 * @constructor
 */
weapi.App = function(divid) {
  weapi.maps.initStatics();

  this.canvas = goog.dom.createElement('canvas');
  this.canvas.style.width = '100%';
  this.canvas.style.height = '100%';
  this.canvas.oncontextmenu = function() {return false;};
  goog.dom.getElement(divid).appendChild(this.canvas);

  /** @type {?Function} */
  this.afterFrameOnce = null;

  this.scene = new Cesium.Scene(this.canvas);

  this.scene.skyAtmosphere = new Cesium.SkyAtmosphere();

  var skyBoxBaseUrl = '../Cesium/Source/Assets/Textures/SkyBox/tycho2t3_80';
  this.scene.skyBox = new Cesium.SkyBox({
    'positiveX' : skyBoxBaseUrl + '_px.jpg',
    'negativeX' : skyBoxBaseUrl + '_mx.jpg',
    'positiveY' : skyBoxBaseUrl + '_py.jpg',
    'negativeY' : skyBoxBaseUrl + '_my.jpg',
    'positiveZ' : skyBoxBaseUrl + '_pz.jpg',
    'negativeZ' : skyBoxBaseUrl + '_mz.jpg'
  });

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

  function animate() {
    // INSERT CODE HERE to update primitives based on
    // changes to animation time, camera parameters, etc.
  }

  var tick = goog.bind(function() {
    this.scene.initializeFrame();
    animate();
    this.scene.render();
    if (goog.isDefAndNotNull(this.afterFrameOnce)) {
      this.afterFrameOnce();
      this.afterFrameOnce = null;
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
