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
   * @type {!Cesium.Cartesian3}
   */
  this.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(
      new Cesium.Cartographic(lng, lat));

  /**
   * @type {string}
   */
  this.src = '';

  /**
   * @type {number}
   * @private
   */
  this.minHeight_ = 0;

  /**
   * @type {?number}
   * @private
   */
  this.maxHeight_ = null;
};


/**
 * @define {number} Reference distance (in meters) for the icon size.
 */
weapi.PolyIcon.REFERENCE_DISTANCE = 1000;


/**
 * @param {number} lat in radians.
 * @param {number} lng in radians.
 */
weapi.PolyIcon.prototype.setLatLng = function(lat, lng) {
  this.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(
      new Cesium.Cartographic(lng, lat));

  if (this.billboard) {
    this.billboard.setPosition(this.position);
  }
};


/**
 * @param {boolean} enable .
 */
weapi.PolyIcon.prototype.enable = function(enable) {
  if (this.billboard) {
    this.billboard.setShow(enable);
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
 * @param {number} height Desired height of the image in pixels
 *                        when observed from the reference distance.
 * @param {number=} opt_minHeight Minimal height of the image in pixels (TODO).
 * @param {?number=} opt_maxHeight Maximal height of the image in pixels (TODO).
 */
weapi.PolyIcon.prototype.setImage = function(src, height,
                                             opt_minHeight,
                                             opt_maxHeight) {
  if (src.length > 0) {
    if (!this.billboard) {
      this.billboard = this.app.polyIconCollection.add();
      this.billboard.setPosition(this.position);
    }
    this.app.polyIconAtlas.getImageIndex(src, goog.bind(function(index) {
      this.billboard.setImageIndex(index);
      var coords = this.app.polyIconAtlas.atlas.getTextureCoordinates()[index];
      var texture = this.app.polyIconAtlas.atlas.getTexture();
      var h = coords.height * texture.getHeight();

      //window['console']['log'](height);
      this.billboard.setScale(weapi.PolyIcon.REFERENCE_DISTANCE * height / h);
    }, this));
    //this.billboard.setVerticalOrigin(Cesium.VerticalOrigin.BOTTOM);
  } else {
    if (this.billboard) {
      this.app.polyIconCollection.remove(this.billboard);
      this.billboard = null;
    }
  }

  this.minHeight_ = opt_minHeight || 0;
  this.maxHeight_ = opt_maxHeight || null;
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
