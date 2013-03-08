/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.utils');


/**
 * @const {number} Simplified Earth radius
 */
weapi.utils.EARTH_RADIUS = 6378137;


/**
 * TODO: fix for other ellipsoids
 * Calculates distance of two points on the surface.
 * @param {number} lat1 .
 * @param {number} lon1 .
 * @param {number} lat2 .
 * @param {number} lon2 .
 * @return {number} Calculated distance.
 */
weapi.utils.calculateDistance = function(lat1, lon1, lat2, lon2) {
  var sindlathalf = Math.sin((lat2 - lat1) / 2);
  var sindlonhalf = Math.sin((lon2 - lon1) / 2);
  var a = sindlathalf * sindlathalf +
          Math.cos(lat1) * Math.cos(lat2) * sindlonhalf * sindlonhalf;
  var angle = 2 * Math.asin(Math.sqrt(a));
  return weapi.utils.EARTH_RADIUS * angle;
};
