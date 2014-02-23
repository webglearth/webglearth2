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

  this.app = app;
  app.sceneChanged = true;

  return this;
});


exportSymbolL('WE.marker', function(pos) {
  if (!goog.isArray(pos)) pos = [pos['lat'], pos['lng']];
  var mark = new weapi.markers.PrettyMarker(goog.math.toRadians(pos[0]),
                                            goog.math.toRadians(pos[1]));
  return mark;
});


exportSymbolL('weapi.exports.Marker.prototype.addTo', function(app) {
  app.markerManager.addMarker(null, this);
  app.sceneChanged = true;
  return this;
});


exportSymbolL('weapi.exports.Marker.prototype.bindPopup',
    function(content, maxWOrOpts, closeBtn) {
      if (!goog.isDefAndNotNull(maxWOrOpts) || goog.isNumber(maxWOrOpts)) {
        this.attachPopup(new weapi.markers.Popup(content,
            maxWOrOpts, closeBtn));
      } else {
        var maxWidth = maxWOrOpts['maxWidth'];
        closeBtn = maxWOrOpts['closeButton'];
        this.attachPopup(new weapi.markers.Popup(content, maxWidth, closeBtn));
      }
      return this;
    });


exportSymbolL('weapi.exports.Marker.prototype.setLatLng', function(pos) {
  if (!goog.isArray(pos)) pos = [pos['lat'], pos['lng']];
  this.setPosition(pos[0], pos[1]);
});


exportSymbolL('WE.polygon', function(points, opts) {
  // our design is not prepared for polygons not assigned to any app -> hack
  return {
    'addTo': function(app) {
      //WARNING: addTo returns something different than WE.polygon !
      var poly = new weapi.exports.Polygon(app);
      var points_ = [];
      goog.array.forEachRight(points, function(el, i, arr) {
        if (!goog.isArray(el)) el = [el['lat'], el['lng']];
        points_.push([el[0], el[1]]);
      });
      poly.addPoints(points_);
      opts = opts || {};
      poly.showDraggers(opts['editable'] == true);
      poly.setStrokeColor(opts['color'] || '#03f',
                          opts['opacity'] || 0.5);
      poly.setFillColor(opts['fillColor'] || '#03f',
                        opts['fillOpacity'] || 0.2);
      poly.polygon_.primitiveLine.setWidth(opts['weight'] || 5); //TODO: cleaner
      return poly;
    }
  };
});
