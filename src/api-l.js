/**
 * Additional Leaflet-style API
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.exportsL');

goog.require('weapi');
goog.require('weapi.exports.App');
goog.require('weapi.maps');


/**
 * @define {boolean} Generate these exports?
 */
weapi.GENERATE_EXPORTS_L = true;

var exportSymbolL = function(symbol, obj) {
  if (weapi.GENERATE_EXPORTS_L) goog.exportSymbol(symbol, obj);
};


exportSymbolL('WE.map', function(id, opt_opts) {
  var opts = opt_opts || {};
  var z = opts['zoom'];
  opts['zoom'] = undefined;
  opts['empty'] = true;
  var app = new weapi.exports.App(id, opts);
  if (z) app.setZoom(z);
  return app;
});


exportSymbolL('WebGLEarth.prototype.setView', function(center, opt_zoom) {
  if (!goog.isArray(center)) center = [center['lat'], center['lng']];
  this.setPosition(center[0], center[1], opt_zoom, undefined, 0, 0);
});


exportSymbolL('WebGLEarth.prototype.zoomIn', function(opt_delta) {
  this.setZoom(this.getZoom + (goog.isNumber(opt_delta) ? opt_delta : 1));
});


exportSymbolL('WebGLEarth.prototype.zoomOut', function(opt_delta) {
  this.setZoom(this.getZoom + (goog.isNumber(opt_delta) ? opt_delta : 1));
});


exportSymbolL('WebGLEarth.prototype.fitBounds', function(bnds) {
  if (!goog.isArray(bnds))
    bnds = [bnds.getSouth(), bnds.getNorth(), bnds.getWest(), bnds.getEast()];
  if (goog.isArray(bnds[0]))
    bnds = [bnds[0][0], bnds[1][0], bnds[0][1], bnds[1][1]];
  this.flyToFitBounds(bnds[0], bnds[1], bnds[2], bnds[3]);
});


exportSymbolL('WebGLEarth.prototype.panTo', function(center) {
  if (!goog.isArray(center)) center = [center['lat'], center['lng']];
  this.flyTo(center[0], center[1], undefined, undefined, 0, 0);
});


exportSymbolL('WE.tileLayer', function(url, opt_opts) {
  var opts = opt_opts || {};
  goog.object.forEach(opts, function(val, k, arr) {
    url = url.replace('{' + k + '}', val);
  });
  url = url.replace('{s}', '{sub}');
  var subdoms = opts['subdomains'] || 'abc';
  if (goog.isString(subdoms)) subdoms = subdoms.split('');
  return weapi.maps.initMap(null, weapi.maps.MapType.CUSTOM, {
    'url': url,
    'maximumLevel': opts['maxZoom'] || 0,
    'tileSize': opts['tileSize'] || 256,
    'flipY': opts['tms'] || false,
    'subdomains': subdoms,
    'copyright': (opts['attribution'] || '').replace(/<(?:.|\n)*?>/gm, ''),
    'proxy': opts['proxy']
  });
});


exportSymbolL('WebGLEarth.Map.prototype.addTo', function(app) {
  this.proxy = app.mapProxyObject;
  var layers = app.centralBody.getImageryLayers();
  layers.add(this.layer);

  app.sceneChanged = true;

  return this;
});
