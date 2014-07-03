/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.Map');



/**
 * @param {!Cesium.ImageryLayer} layer .
 * @constructor
 */
weapi.Map = function(layer) {
  /**
   * @type {!Cesium.ImageryLayer}
   */
  this.layer = layer;

  /**
   * @type {?weapi.App}
   */
  this.app = null;
};


/**
 * @param {number} minLat Minimal latitude in degrees.
 * @param {number} maxLat Maximal latitude in degrees.
 * @param {number} minLon Minimal longitude in degrees.
 * @param {number} maxLon Maximal longitude in degrees.
 */
weapi.Map.prototype.setBoundingBox = function(minLat, maxLat,
                                              minLon, maxLon) {
  var extent = this.layer.imageryProvider['_rectangle'];
  extent.west = goog.math.toRadians(minLon);
  extent.south = goog.math.toRadians(goog.math.clamp(minLat, -85.051, 85.051));
  extent.east = goog.math.toRadians(maxLon);
  extent.north = goog.math.toRadians(goog.math.clamp(maxLat, -85.051, 85.051));
  if (this.app) this.app.sceneChanged = true;
};


/**
 * @param {number} opacity Opacity.
 */
weapi.Map.prototype.setOpacity = function(opacity) {
  this.layer.alpha = opacity;
  if (this.app) this.app.sceneChanged = true;
};


/**
 * @return {number} Opacity.
 */
weapi.Map.prototype.getOpacity = function() {
  return this.layer.alpha;
};
