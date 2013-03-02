/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.Camera');

goog.require('goog.dom');



/**
 *
 * @param {Cesium.Camera} camera .
 * @param {Cesium.Ellipsoid} ellipsoid .
 * @constructor
 */
weapi.Camera = function(camera, ellipsoid) {
  this.camera = camera;
  this.ellipsoid = ellipsoid;
};


/**
 * @return {Array.<number>} [latitude, longitude, altitude].
 */
weapi.Camera.prototype.getPos = function() {
  var carto = new Cesium.Cartographic(0, 0, 0);
  this.ellipsoid.cartesianToCartographic(this.camera.position, carto);

  return [carto.latitude, carto.longitude, carto.height];
};


/**
 * @param {number|undefined} latitude .
 * @param {number|undefined} longitude .
 * @param {number|undefined} altitude .
 */
weapi.Camera.prototype.setPos = function(latitude, longitude, altitude) {
  if (!goog.isDef(latitude) ||
      !goog.isDef(longitude) ||
      !goog.isDef(altitude)) {
    var oldPos = this.getPos();
    latitude = latitude || oldPos[0];
    longitude = longitude || oldPos[1];
    altitude = altitude || oldPos[2];
  }
  var carto = new Cesium.Cartographic(longitude, latitude, altitude);

  this.camera.controller.setPositionCartographic(carto);
};


/**
 * @return {number} Heading in radians.
 */
weapi.Camera.prototype.getHeading = function() {
  var camera = this.camera;

  var normal = new Cesium.Cartesian3(-camera.position.y, camera.position.x, 0);
  // = Cesium.Cartesian3.UNIT_Z.cross(camera.position).normalize();
  var angle = Math.acos(camera.up.dot(normal.normalize())) - Math.PI / 2;
  return (camera.up.z > 0 ? angle : -angle - (angle > 0 ? -Math.PI : Math.PI));
};


/**
 * @return {number} Tilt in radians.
 */
weapi.Camera.prototype.getTilt = function() {
  var camera = this.camera;

  var angle = Math.acos(camera.up.dot(camera.position.normalize()));

  return -angle + Math.PI / 2;
};
