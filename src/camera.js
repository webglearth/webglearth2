/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.Camera');

goog.require('goog.dom');

goog.require('weapi.CameraAnimator');
goog.require('weapi.utils');



/**
 *
 * @param {!Cesium.Camera} camera .
 * @param {Cesium.Ellipsoid} ellipsoid .
 * @constructor
 */
weapi.Camera = function(camera, ellipsoid) {
  this.camera = camera;
  this.ellipsoid = ellipsoid;
  this.animator = new weapi.CameraAnimator(this);
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
    latitude = goog.isDefAndNotNull(latitude) ? latitude : oldPos[0];
    longitude = goog.isDefAndNotNull(longitude) ? longitude : oldPos[1];
    altitude = altitude > 0 ? altitude : oldPos[2];
  }
  var pos = Cesium.Cartesian3.fromRadians(longitude, latitude, altitude);
  this.camera.setView({
    'position': pos,
    'heading': 0,
    'pitch': -Math.PI / 2,
    'roll': 0
  });
};


/**
 * @return {number} Heading in radians.
 */
weapi.Camera.prototype.getHeading = function() {
  var camera = this.camera;
  var pos = camera.positionWC; //this forces the update

  var normal = new Cesium.Cartesian3(-pos.y, pos.x, 0);
  // = Cesium.Cartesian3.UNIT_Z.cross(pos).normalize();
  //var angle = (camera.right.angleBetween(normal.normalize()));
  var angle = Cesium.Cartesian3.angleBetween(camera.right, normal);
  var orientation = Cesium.Cartesian3.cross(pos, camera.up,
                                            new Cesium.Cartesian3()).z;

  return (orientation < 0 ? angle : -angle);
};


/**
 * @return {number} Tilt in radians.
 */
weapi.Camera.prototype.getTilt = function() {
  var camera = this.camera;
  var pos = camera.positionWC; //this forces the update

  var angle = Math.acos(Cesium.Cartesian3.dot(camera.up,
      Cesium.Cartesian3.normalize(pos, new Cesium.Cartesian3())));

  return -angle + Math.PI / 2;
};


/**
 * @param {number} heading .
 */
weapi.Camera.prototype.setHeading = function(heading) {
  var heading_, tilt_ = this.getTilt();

  heading_ = heading - this.getHeading();
  this.camera.lookDown(tilt_);
  this.camera.twistLeft(heading_);
  this.camera.lookUp(tilt_);
};


/**
 * @param {number} tilt .
 */
weapi.Camera.prototype.setTilt = function(tilt) {
  var tilt_ = tilt - this.getTilt();

  var heading_ = this.getHeading();
  this.camera.lookUp(tilt_);
  this.setHeading(heading_); //re-set the heading
};


/**
 * @param {number} heading .
 * @param {number} tilt .
 */
weapi.Camera.prototype.setHeadingAndTilt = function(heading, tilt) {
  var heading_, tilt_ = this.getTilt();

  heading_ = heading - this.getHeading();
  this.camera.lookDown(tilt_);
  this.camera.twistLeft(heading_);
  this.camera.lookUp(tilt);
};


/**
 * The most effective way to set complete camera position.
 * @param {number} lat .
 * @param {number} lng .
 * @param {number} alt .
 * @param {number} heading .
 * @param {number} tilt .
 */
weapi.Camera.prototype.setPosHeadingAndTilt = function(lat, lng, alt,
                                                       heading, tilt) {
  var pos = Cesium.Cartesian3.fromRadians(lng, lat, alt);
  this.camera.setView({
    'position': pos,
    'heading': 0,
    'pitch': -Math.PI / 2,
    'roll': 0
  });
  this.camera.twistLeft(heading);
  this.camera.lookUp(tilt);
};


/**
 * Calculates at what distance should given bounds be view to fit on screen.
 * @param {number} minlat .
 * @param {number} maxlat .
 * @param {number} minlon .
 * @param {number} maxlon .
 * @return {number} Proposed distance.
 */
weapi.Camera.prototype.calcDistanceToViewBounds = function(minlat, maxlat,
                                                           minlon, maxlon) {
  var centerLat = (minlat + maxlat) / 2;

  var distEW = weapi.utils.calculateDistance(centerLat, minlon,
      centerLat, maxlon);

  var distNS = weapi.utils.calculateDistance(minlat, 0,
      maxlat, 0);

  var aspectR =
      Math.min(Math.max(this.camera.frustum.aspectRatio, distEW / distNS), 1.0);

  // Create a LookAt using the experimentally derived distance formula.
  var alpha =
      goog.math.toRadians(goog.math.toDegrees(this.camera.frustum.fovy) /
      (aspectR + 0.4) - 2.0);
  var expandToDistance = Math.max(distNS, distEW);

  var beta =
      Math.min(Math.PI / 2,
               alpha + expandToDistance / (2 * weapi.utils.EARTH_RADIUS));

  var lookAtRange = 1.5 * weapi.utils.EARTH_RADIUS *
      (Math.sin(beta) * Math.sqrt(1 + 1 / Math.pow(Math.tan(alpha), 2)) - 1);

  return lookAtRange;
};


/**
 * Calculates such coordinates of the camera, that when we place
 * the camera there with specified heading and tilt the original
 * [lat, lng] is in the center of the view and at specified distance.
 * @param {number} lat Latitude in radians.
 * @param {number} lng Longitude in radians.
 * @param {number} alt Altitude in meters.
 * @param {number=} opt_heading Heading  in radians (otherwise 0).
 * @param {number=} opt_tilt Tilt  in radians (otherwise 0).
 * @return {!Array.<number>} Array [lat, lng] in radians.
 */
weapi.Camera.calculatePositionForGivenTarget = function(lat, lng, alt,
                                                        opt_heading,
                                                        opt_tilt) {
  alt /= weapi.utils.EARTH_RADIUS;
  var innerAngle = Math.PI - (opt_tilt || 0);

  // we have the following triangle:
  //   side a=dist (desired distance of camera from the target)
  //   side b=1 (Earth radius)
  //   side c=1 + alt
  //   angle gamma=innerAngle (between a and b)
  // Using the law of sines we can calculate beta:
  //   sin(beta) / b = sin(gamma) / c
  var c = 1 + alt;
  var beta = Math.asin(Math.sin(innerAngle) / c);
  var alpha = Math.PI - beta - innerAngle;

  var head = opt_heading || 0;

  return [lat - Math.cos(head) * alpha, lng + Math.sin(head) * alpha];
};


/**
 * Calculates altitude from zoom (very rough approximation for deprecated API)
 * @param {!HTMLCanvasElement} canvas .
 * @param {number} fov Vertical fov in radians.
 * @param {number} zoom Zoom.
 * @param {number} latitude Latitude in radians.
 * @return {number} Calculated altitude.
 */
weapi.Camera.calcAltitudeForZoom = function(canvas, fov, zoom, latitude) {
  // 0.7 is old constant from WebGL Earth, 256 is tile size
  var tilesVertically = 0.7 * canvas.height / 256;

  var o = Math.cos(Math.abs(latitude)) * 2 * Math.PI;
  var thisPosDeformation = o / Math.pow(2, zoom);
  var sizeIWannaSee = thisPosDeformation * tilesVertically;
  return (1 / Math.tan(fov / 2)) * (sizeIWannaSee / 2) *
         weapi.utils.EARTH_RADIUS;
};


/**
 * Calculates zoom from altitude (very rough approximation for deprecated API)
 * @param {!HTMLCanvasElement} canvas .
 * @param {number} fov Vertical fov in radians.
 * @param {number} altitude Altitude in meters.
 * @param {number} latitude Latitude in radians.
 * @return {number} Calculated zoom.
 */
weapi.Camera.calcZoomForAltitude = function(canvas, fov, altitude, latitude) {
  // 0.7 is old constant from WebGL Earth, 256 is tile size
  var tilesVertically = 0.7 * canvas.height / 256;

  var sizeISee = 2 * (altitude / weapi.utils.EARTH_RADIUS) * Math.tan(fov / 2);
  var sizeOfOneTile = sizeISee / tilesVertically;
  var o = Math.cos(Math.abs(latitude)) * 2 * Math.PI;

  return Math.log(o / sizeOfOneTile) / Math.LN2;
};
