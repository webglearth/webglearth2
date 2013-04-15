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
  this.height_ = 0;

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

  /**
   * @type {number}
   * @private
   */
  this.aspectRatio_ = 1;
};


/*
 * inheritDoc
 */
/*weapi.PolyIcon.prototype.setXY = function(x, y) {
  weapi.PolyIcon.superClass_.setXY.call(this, x, y);

  var pos = Cesium.Ellipsoid.WGS84.cartographicToCartesian(
      new Cesium.Cartographic(this.lon, this.lat));
  var cam = this.app.camera.camera.position;
  var xto2 = function(x) {return x * x;};
  var distance = Math.sqrt(xto2(pos.x - cam.x) +
                           xto2(pos.y - cam.y) +
                           xto2(pos.z - cam.z));
  var height =
      (weapi.PolyIcon.REFERENCE_DISTANCE * this.height_) / distance;
  height = goog.math.clamp(height,
                           this.minHeight_,
                           this.maxHeight_ || Number.MAX_VALUE);

  this.image_.height = height;
  this.image_.width = height * this.aspectRatio_;
  this.image_.style.marginLeft = '-' + (this.image_.width / 2) + 'px';
  this.image_.style.marginTop = '-' + (this.image_.height / 2) + 'px';
  this.image_.style.display = 'block';
};*/


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
 * @param {number} height Height of the image in meters (0 for no resizing).
 * @param {number=} opt_minHeight Minimal height of the image in pixels.
 * @param {?number=} opt_maxHeight Maximal height of the image in pixels.
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
      this.aspectRatio_ = coords.width / coords.height;
    }, this));
    //this.billboard
    //TODO: proper scaling
    this.billboard.setScale(0.5);
  } else {
    if (this.billboard) {
      this.app.polyIconCollection.remove(this.billboard);
      this.billboard = null;
    }
  }

  this.height_ = height;
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
