/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.CustomMap');



/**
 * @param {Object.<string, Object>} opts .
 * @extends {Cesium.TileMapServiceImageryProvider}
 * @constructor
 */
weapi.CustomMap = function(opts) {
  this.url = /** @type {string} */(opts['url']);

  this.minZoom = /** @type {number} */(opts['minimumLevel'] || 0);
  this.maxZoom = /** @type {number} */(opts['maximumLevel'] || 18);

  this.tileSize = /** @type {number} */(opts['tileSize'] || 256);

  var b = opts['bounds'];
  if (b && b.length && b.length > 3) {
    this.extent = new Cesium.Extent(goog.math.toRadians(b[0]),
                                    goog.math.toRadians(b[1]),
                                    goog.math.toRadians(b[2]),
                                    goog.math.toRadians(b[3]));
  } else {
    //this.extent = Cesium.Extent.MAX_VALUE;
  }

  this.flipY = /** @type {boolean} */(opts['flipY'] || false);

  this.subdomains = /** @type {Array.<string>} */(opts['subdomains'] || []);

  this.credit = Cesium.writeTextToCanvas((opts['copyright'] || '').toString());

  this.proxy = opts['proxy'] || null;

  this.emptyTile = goog.dom.createElement('canvas');
  this.emptyTile.width = this.tileSize;
  this.emptyTile.height = this.tileSize;

  var forward = {'url': this.buildTileURL(0, 0, 0), 'extent': this.extent};
  //if (this.proxy) forward['proxy'] = this.proxy;

  goog.base(this, forward);
};
goog.inherits(weapi.CustomMap, Cesium.TileMapServiceImageryProvider);


/**
 * @return {HTMLCanvasElement} .
 * @this {weapi.CustomMap}
 */
weapi.CustomMap.prototype['getLogo'] = function() {
  return this.credit;
};


/**
 * @return {number} .
 * @this {weapi.CustomMap}
 */
weapi.CustomMap.prototype['getMinimumLevel'] = function() {
  return this.minZoom;
};


/**
 * @return {number} .
 * @this {weapi.CustomMap}
 */
weapi.CustomMap.prototype['getMaximumLevel'] = function() {
  return this.maxZoom;
};


/**
 * @return {number} .
 * @this {weapi.CustomMap}
 */
weapi.CustomMap.prototype['getTileHeight'] = function() {
  return this.tileSize;
};


/**
 * @return {number} .
 * @this {weapi.CustomMap}
 */
weapi.CustomMap.prototype['getTileWidth'] = function() {
  return this.tileSize;
};


/**
 * @param {number} zoom .
 * @param {number} x .
 * @param {number} y .
 * @return {string} .
 */
weapi.CustomMap.prototype.buildTileURL = function(zoom, x, y) {
  /** @type {string} */
  var url = this.url.replace('{z}', zoom.toFixed(0));
  url = url.replace('{x}', x.toFixed(0));
  url = url.replace('{y}', (this.flipY ? ((1 << zoom) - y - 1) : y).toFixed(0));
  if (this.subdomains.length > 0) {
    var subid = goog.math.modulo(x + y + zoom, this.subdomains.length);
    url = url.replace('{sub}', this.subdomains[subid]);
  }
  return this.proxy ? this.proxy['getURL'](url) : url;
};


/**
 * @return {string} .
 * @this {weapi.CustomMap}
 */
weapi.CustomMap.prototype['getUrl'] = function() {
  return this.buildTileURL(0, 0, 0);
};


/**
 * @param {number} x .
 * @param {number} y .
 * @param {number} level .
 * @return {Object} .
 * @this {weapi.CustomMap}
 */
weapi.CustomMap.prototype['requestImage'] = function(x, y, level) {
  if (level < this.minZoom || level > this.maxZoom) return this.emptyTile;
  var url = this.buildTileURL(level, x, y);
  return Cesium.ImageryProvider.loadImage(url);
};
