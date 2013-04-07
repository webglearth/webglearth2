/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.markers.PolyIcon');

goog.require('goog.dom');
goog.require('weapi.markers.AbstractMarker');
goog.require('weapi.markers.Popup');



/**
 * @inheritDoc
 * @param {number} lat .
 * @param {number} lon .
 * @param {!weapi.App} app .
 * @extends {weapi.markers.AbstractMarker}
 * @constructor
 */
weapi.markers.PolyIcon = function(lat, lon, app) {
  /**
   * @type {!weapi.App}
   */
  this.app = app;

  /**
   * @type {!HTMLImageElement}
   * @private
   */
  this.image_ = /** @type {!HTMLImageElement} */
      (goog.dom.createDom('img',
      {'style': 'position:absolute;pointer-events:none;z-index:101;',
        'crossOrigin': null}));

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

  goog.base(this, lat, lon, this.image_);

  this.show(false);
};
goog.inherits(weapi.markers.PolyIcon, weapi.markers.AbstractMarker);


/**
 * @define {number} Reference distance (in meters) for the icon size.
 */
weapi.markers.PolyIcon.REFERENCE_DISTANCE = 1000;


/**
 * @inheritDoc
 */
weapi.markers.PolyIcon.prototype.setXY = function(x, y) {
  weapi.markers.PolyIcon.superClass_.setXY.call(this, x, y);

  var pos = Cesium.Ellipsoid.WGS84.cartographicToCartesian(
      new Cesium.Cartographic(this.lon, this.lat));
  var cam = this.app.camera.camera.position;
  var xto2 = function(x) {return x * x;};
  var distance = Math.sqrt(xto2(pos.x - cam.x) +
                           xto2(pos.y - cam.y) +
                           xto2(pos.z - cam.z));
  var height =
      (weapi.markers.PolyIcon.REFERENCE_DISTANCE * this.height_) / distance;
  height = goog.math.clamp(height,
                           this.minHeight_,
                           this.maxHeight_ || Number.MAX_VALUE);

  this.image_.height = height;
  this.image_.width = height * this.aspectRatio_;
  this.image_.style.marginLeft = '-' + (this.image_.width / 2) + 'px';
  this.image_.style.marginTop = '-' + (this.image_.height / 2) + 'px';
  this.image_.style.display = 'block';
};


/**
 * @param {string} src URL of the image to use.
 * @param {number} height Height of the image in meters (0 for no resizing).
 * @param {number=} opt_minHeight Minimal height of the image in pixels.
 * @param {?number=} opt_maxHeight Maximal height of the image in pixels.
 */
weapi.markers.PolyIcon.prototype.setImage = function(src, height,
                                                     opt_minHeight,
                                                     opt_maxHeight) {
  this.image_.onload = goog.bind(function() {
    this.aspectRatio_ = this.image_.naturalWidth / this.image_.naturalHeight;
  }, this);
  this.image_.style.display = 'none';
  this.image_.src = src;
  this.src = src;
  this.enabled = this.src.length > 0;

  this.height_ = height;
  this.minHeight_ = opt_minHeight || 0;
  this.maxHeight_ = opt_maxHeight || null;
};


/**
 * @param {number} x .
 * @param {number} y .
 * @return {boolean} .
 */
weapi.markers.PolyIcon.prototype.isPointIn = function(x, y) {
  var img = this.image_;
  x -= parseInt(img.style.left, 10);
  y -= parseInt(img.style.top, 10);

  var width = parseInt(img.width, 10);
  var height = parseInt(img.height, 10);
  return (Math.abs(x) <= width / 2 && Math.abs(y) <= height / 2);
};


/**
 * @inheritDoc
 */
weapi.markers.PolyIcon.prototype.draw2D = function(ctx) {
  if (!this.isVisible()) return;
  ctx.drawImage(this.image_,
                parseInt(this.image_.style.left, 10) - this.image_.width / 2,
                parseInt(this.image_.style.top, 10) - this.image_.height / 2,
                this.image_.width, this.image_.height);
};
