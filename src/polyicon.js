/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.PolyIcon');

goog.require('goog.dom');
goog.require('weapi.markers.Popup');



/**
 * @param {number} lat in radians.
 * @param {number} lng in radians.
 * @param {!weapi.App} app .
 * @constructor
 */
weapi.PolyIcon = function(lat, lng, app) {
  /**
   * @type {!weapi.App}
   */
  this.app = app;

  /**
   * @type {?Cesium.Billboard}
   */
  this.billboard = null;

  /**
   * @type {number}
   * @private
   */
  this.lat_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.lng_ = 0;

  this.setLatLng(lat, lng);

  /**
   * @type {string}
   */
  this.src = '';
};


/**
 * @define {number} Reference distance (in meters) for the icon size.
 */
weapi.PolyIcon.REFERENCE_DISTANCE = 1000;


/**
 * @define {number} Reference canvas height (in pixels).
 */
weapi.PolyIcon.REFERENCE_CANVAS_HEIGHT = 768;


/**
 * @param {number} lat in radians.
 * @param {number} lng in radians.
 */
weapi.PolyIcon.prototype.setLatLng = function(lat, lng) {
  this.lat_ = lat;
  this.lng_ = lng;

  if (this.billboard) {
    var position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(
        new Cesium.Cartographic(this.lng_, this.lat_));

    this.billboard.position = position;
  }
};


/**
 * @param {boolean} enable .
 */
weapi.PolyIcon.prototype.enable = function(enable) {
  if (this.billboard) {
    this.billboard.show = enable;
  }
};


/**
 */
weapi.PolyIcon.prototype.destroy = function() {
  if (this.billboard) {
    this.app.polyIconCollection.remove(this.billboard);
    this.billboard = null;
  }
};


/**
 * @param {string} src URL of the image to use.
 * @param {number} width Desired width of the image in meters.
 * @param {number} height Desired height of the image in meters.
 */
weapi.PolyIcon.prototype.setImage = function(src, width, height) {
  if (src.length > 0) {
    if (!this.billboard) {
      this.billboard = this.app.polyIconCollection.add();
      this.setLatLng(this.lat_, this.lng_);
    }
    this.billboard.image = src;
    this.billboard.width = width;
    this.billboard.height = height;
    this.billboard.sizeInMeters = true;
    this.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

    this.setLatLng(this.lat_, this.lng_);
    this.app.sceneChanged = true;
  } else {
    if (this.billboard) {
      this.app.polyIconCollection.remove(this.billboard);
      this.billboard = null;
    }
  }
};


/**
 * @param {number} x .
 * @param {number} y .
 * @return {boolean} .
 */
weapi.PolyIcon.prototype.isPointIn = function(x, y) {
  //TODO: (?)
  return false;
};
