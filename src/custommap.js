/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.CustomMap');



/**
 * @param {Object.<string, string|number|Object>} opts .
 * @extends {Cesium.TileMapServiceImageryProvider}
 * @constructor
 */
weapi.CustomMap = function(opts) {
  this.setOptions(opts);
};
goog.inherits(weapi.CustomMap, Cesium.TileMapServiceImageryProvider);


/**
 * @param {Object.<string, string|number|Object>} opts .
 */
weapi.CustomMap.prototype.setOptions = function(opts) {
  this['_url'] = /** @type {string} */(opts['url']);

  this['_minimumLevel'] = /** @type {number} */(opts['minimumLevel'] || 0);
  this['_maximumLevel'] = /** @type {number} */(opts['maximumLevel'] || 18);

  this.tileSize = /** @type {number} */(opts['tileSize'] || 256);
  this['_tileWidth'] = this['_tileHeight'] = this.tileSize;

  var b = opts['bounds'], rectangle = null;
  if (b && b.length && b.length > 3) {
    rectangle = new Cesium.Rectangle(goog.math.toRadians(b[0]),
                                     goog.math.toRadians(b[1]),
                                     goog.math.toRadians(b[2]),
                                     goog.math.toRadians(b[3]));
  }

  this.flipY = /** @type {boolean} */(opts['flipY'] || false);

  this.subdomains = /** @type {Array.<string>} */(opts['subdomains'] || []);

  this['_credit'] = new Cesium.Credit((opts['copyright'] || '').toString(),
      undefined, opts['copyrightLink'] ? opts['copyrightLink'].toString() : undefined);

  this['_proxy'] = opts['proxy'] || undefined;

  this.emptyTile = goog.dom.createElement('canvas');
  this.emptyTile.width = this.tileSize;
  this.emptyTile.height = this.tileSize;

  this['_errorEvent'] = new Cesium.Event();
  this['_tilingScheme'] = new Cesium.WebMercatorTilingScheme();
  this['_rectangle'] = rectangle || this['_tilingScheme']['rectangle'];
  this['_ready'] = goog.isDefAndNotNull(this['_url']);
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
 * @param {number} x .
 * @param {number} y .
 * @param {number} level .
 * @return {Object} .
 * @this {weapi.CustomMap}
 */
weapi.CustomMap.prototype['requestImage'] = function(x, y, level) {
  if (level < this.minimumLevel ||
      level > this.maximumLevel) return this.emptyTile;
  var url = this.buildTileURL(level, x, y);
  return Cesium.ImageryProvider.loadImage(this, url);
};
