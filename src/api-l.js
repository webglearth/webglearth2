/**
 * Additional Leaflet-style API
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.exportsL');

goog.require('goog.net.Jsonp');

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
  this.setZoom(this.getZoom() + (goog.isNumber(opt_delta) ? opt_delta : 1));
});


exportSymbolL('WebGLEarth.prototype.zoomOut', function(opt_delta) {
  this.setZoom(this.getZoom() - (goog.isNumber(opt_delta) ? opt_delta : 1));
});


exportSymbolL('WebGLEarth.prototype.panInsideBounds', function(bnds, opt_opts) {
  if (!goog.isArray(bnds))
    bnds = [bnds.getSouth(), bnds.getNorth(), bnds.getWest(), bnds.getEast()];
  if (goog.isArray(bnds[0]))
    bnds = [bnds[0][0], bnds[1][0], bnds[0][1], bnds[1][1]];
  opt_opts = opt_opts || {};
  this.flyToFitBounds(bnds[0], bnds[1], bnds[2], bnds[3],
                      opt_opts['heading'], opt_opts['tilt'],
                      opt_opts['duration']);
});


exportSymbolL('WebGLEarth.prototype.fitBounds', function(bnds, opt_opts) {
  if (!goog.isArray(bnds))
    bnds = [bnds.getSouth(), bnds.getNorth(), bnds.getWest(), bnds.getEast()];
  if (goog.isArray(bnds[0]))
    bnds = [bnds[0][0], bnds[1][0], bnds[0][1], bnds[1][1]];
  opt_opts = opt_opts || {};

  var minlat = goog.math.toRadians(bnds[0]);
  var maxlat = goog.math.toRadians(bnds[1]);
  var minlon = goog.math.toRadians(bnds[2]);
  var maxlon = goog.math.toRadians(bnds[3]);
  var opt_heading = opt_opts['heading'], opt_tilt = opt_opts['tilt'];

  var altitude = this.camera.calcDistanceToViewBounds(minlat, maxlat,
      minlon, maxlon);

  minlon = goog.math.modulo(minlon, 2 * Math.PI);
  maxlon = goog.math.modulo(maxlon, 2 * Math.PI);

  var lonDiff = minlon - maxlon;
  if (lonDiff < -Math.PI) {
    minlon += 2 * Math.PI;
  } else if (lonDiff > Math.PI) {
    maxlon += 2 * Math.PI;
  }

  var center = [(minlat + maxlat) / 2, (minlon + maxlon) / 2];

  this.setPosition(
      goog.math.toDegrees(center[0]), goog.math.toDegrees(center[1]),
      undefined, altitude,
      opt_heading, opt_tilt, goog.isDef(opt_heading) || goog.isDef(opt_tilt));
});


exportSymbolL('WebGLEarth.prototype.panTo', function(center, opt_opts) {
  if (!goog.isArray(center)) center = [center['lat'], center['lng']];
  opt_opts = opt_opts || {};
  this.flyTo(center[0], center[1], undefined, undefined, 0, 0,
             undefined, opt_opts['duration']);
});


exportSymbolL('WE.tileLayer', function(url, opt_opts) {
  var opts = opt_opts || {};
  goog.object.forEach(opts, function(val, k, arr) {
    url = url.replace('{' + k + '}', val);
  });
  url = url.replace('{s}', '{sub}');
  var subdoms = opts['subdomains'] || 'abc';
  if (goog.isString(subdoms)) subdoms = subdoms.split('');
  var bnds = opts['bounds'];
  if (bnds && goog.isArray(bnds[0]))
    bnds = [bnds[0][0], bnds[1][0], bnds[0][1], bnds[1][1]];
  return weapi.maps.initMap(null, weapi.maps.MapType.CUSTOM, {
    'url': url,
    'minimumLevel': opts['minZoom'] || 0,
    'maximumLevel': opts['maxZoom'] || 18,
    'tileSize': opts['tileSize'] || 256,
    'flipY': opts['tms'] || false,
    'subdomains': subdoms,
    'copyright': (opts['attribution'] || '').replace(/<(?:.|\n)*?>/gm, ''),
    'opacity': opts['opacity'],
    'bounds': bnds
  });
});


exportSymbolL('WE.tileLayerJSON', function(data, opt_app) {
  var load = function(data, opt_app, opt_map) {
    var url = data['tiles'][0];
    var attribution = data['attribution'];
    var minzoom = data['minzoom'];
    var maxzoom = data['maxzoom'];
    var bnds = data['bounds'];
    var center = data['center'];

    var opts = {
      'url': url,
      'minimumLevel': minzoom || 0,
      'maximumLevel': maxzoom || 18,
      'copyright': (attribution || '').replace(/<(?:.|\n)*?>/gm, ''),
      'bounds': bnds ? [bnds[1], bnds[3], bnds[0], bnds[2]] : undefined
    };
    var map;

    if (opt_map) {
      var prov = /** @type {!weapi.CustomMap} */(opt_map.layer.imageryProvider);
      prov.setOptions(opts);
      map = opt_map;
      if (data['opacity'] && map.getOpacity() == 1)
        map.setOpacity(parseFloat(data['opacity']));
      if (bnds) map.setBoundingBox(bnds[1], bnds[3], bnds[0], bnds[2]);
    } else {
      map = weapi.maps.initMap(null, weapi.maps.MapType.CUSTOM, opts);
    }

    if (opt_app) {
      map['addTo'](opt_app);
      if (center && center.length && center.length > 1) {
        opt_app.setPosition(center[1], center[0]);
        if (center.length > 2) {
          opt_app.setZoom(center[2]);
        }
      }
    }
    return map;
  };
  var map;
  if (goog.isString(data)) {
    map = weapi.maps.initMap(null, weapi.maps.MapType.CUSTOM, {});
    var jsonp = new goog.net.Jsonp(data);
    jsonp.send(undefined, function(data) {
      load(data, opt_app, map);
    });
  } else {
    map = load(data, opt_app, undefined);
  }

  return map;
});


exportSymbolL('WebGLEarth.Map.prototype.addTo', function(app) {
  this.layer.imageryProvider.proxy = app.mapProxyObject;
  var layers = app.scene.imageryLayers;
  layers.add(this.layer);
  app.listenCORSErrors(this.layer.imageryProvider['errorEvent']);
  this.app = app;
  app.sceneChanged = true;

  return this;
});


exportSymbolL('WebGLEarth.Map.prototype.removeFrom', function(app) {
  app = this.app;
  var layers = app.scene.imageryLayers;
  layers.remove(this.layer);
  app.sceneChanged = true;
  this.app = null;

  return this;
});


exportSymbolL('WE.marker', function(pos, opt_iconUrl, opt_width, opt_height) {
  if (!goog.isArray(pos)) pos = [pos['lat'], pos['lng']];
  var mark = new weapi.markers.PrettyMarker(goog.math.toRadians(pos[0]),
                                            goog.math.toRadians(pos[1]),
                                            opt_iconUrl, opt_width, opt_height);
  return mark;
});


exportSymbolL('WebGLEarth.Marker.prototype.addTo', function(app) {
  app.markerManager.addMarker(goog.getUid(this).toString(), this);
  app.sceneChanged = true;
  return this;
});


exportSymbolL('WebGLEarth.Marker.prototype.removeFrom', function(app) {
  app.markerManager.removeMarker(goog.getUid(this).toString());
  app.sceneChanged = true;
  return this;
});


exportSymbolL('WebGLEarth.Marker.prototype.bindPopup',
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


exportSymbolL('WebGLEarth.Marker.prototype.setLatLng', function(pos) {
  if (!goog.isArray(pos)) pos = [pos['lat'], pos['lng']];
  this.setPosition(pos[0], pos[1]);
});


exportSymbolL('WE.polygon', function(points, opts) {
  // our design is not prepared for polygons not assigned to any app -> hack
  return {
    'addTo': /** @suppress {accessControls} */function(app) {
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
      poly.polygon_.primitiveLine.width = opts['weight'] || 5; //TODO: cleaner
      return poly;
    }
  };
});
