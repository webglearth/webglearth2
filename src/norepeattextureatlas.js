/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.NoRepeatTextureAtlas');



/**
 * @param {!weapi.App} app .
 * @constructor
 */
weapi.NoRepeatTextureAtlas = function(app) {
  /**
   * @type {!weapi.App}
   * @private
   */
  this.app_ = app;

  /**
   * @type {!Cesium.TextureAtlas}
   */
  this.atlas = new Cesium.TextureAtlas({'scene': this.app_.scene});

  /**
   * @type {!Object.<!string, number>}
   */
  this.urlToAtlasIndexMap = {};
};


/**
 * @param {string} url .
 * @param {function(number)} callback .
 */
weapi.NoRepeatTextureAtlas.prototype.getImageIndex = function(url, callback) {
  if (!goog.isDefAndNotNull(this.urlToAtlasIndexMap[url])) {
    var image = new Image();
    image.onload = goog.bind(function() {
      this.urlToAtlasIndexMap[url] = this.atlas.addImage(image);
      callback(this.urlToAtlasIndexMap[url]);
    }, this);
    image.src = url;
  } else {
    callback(this.urlToAtlasIndexMap[url]);
  }
};
