/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.App');

goog.require('goog.dom');



/**
 *
 * @param {string} divid .
 * @constructor
 */
weapi.App = function(divid) {
  this.canvas = goog.dom.createElement('canvas');
  this.canvas.style.width = '100%';
  this.canvas.style.height = '100%';
  goog.dom.getElement(divid).appendChild(this.canvas);

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

  primitives.setCentralBody(this.centralBody);

  function animate() {
    // INSERT CODE HERE to update primitives based on
    // changes to animation time, camera parameters, etc.
  }

  var tick = goog.bind(function() {
    this.scene.initializeFrame();
    animate();
    this.scene.render();
    Cesium.requestAnimationFrame(tick);
  }, this);
  tick();

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
 * @return {Array.<number>} [latitude, longitude, altitude].
 */
weapi.App.prototype.getCameraPos = function() {
  var camera = this.scene.getCamera();
  var carto = new Cesium.Cartographic(0, 0, 0);
  this.centralBody.getEllipsoid().cartesianToCartographic(camera.position,
                                                          carto);

  return [carto.latitude, carto.longitude, carto.height];
};


/**
 * @param {number|undefined} latitude .
 * @param {number|undefined} longitude .
 * @param {number|undefined} altitude .
 */
weapi.App.prototype.setCameraPos = function(latitude, longitude, altitude) {
  var camera = this.scene.getCamera();
  if (!goog.isDef(latitude) ||
      !goog.isDef(longitude) ||
      !goog.isDef(altitude)) {
    var oldPos = this.getCameraPos();
    latitude = latitude || oldPos[0];
    longitude = longitude || oldPos[1];
    altitude = altitude || oldPos[2];
  }
  var carto = new Cesium.Cartographic(longitude, latitude, altitude);

  camera.controller.setPositionCartographic(carto);
};

