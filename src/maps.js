/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.maps');
goog.provide('weapi.maps.MapType');

goog.require('goog.Uri.QueryData');
goog.require('goog.structs.Map');

goog.require('weapi.CustomMap');
goog.require('weapi.Map');


/**
 * Constants for map names.
 * @enum {string}
 */
weapi.maps.MapType = {
  'OSM': 'osm',
  'BING': 'bing',
  'WMS': 'wms',
  'CUSTOM': 'custom'
};


/**
 * @type {!goog.structs.Map}
 */
weapi.maps.mapMap = new goog.structs.Map();


/**
 * TODO: cleanup
 * @param {?weapi.App} app .
 * @param {!weapi.maps.MapType} type Type of the map.
 * @param {!Object.<string, Object>|!Array.<Object>=} opt_opts Map options.
 * @return {weapi.Map} Initialized TileProvider.
 */
weapi.maps.initMap = function(app, type, opt_opts) {

  /** @type {string} */
  var key = type;

  var mapopts = null;
  var aropts = null;
  if (goog.isDefAndNotNull(opt_opts)) {
    if (goog.isArray(opt_opts)) {
      if (opt_opts.length > 0) key += opt_opts[0];
      aropts = opt_opts;
      //alert(type + ' got array');
    } else {
      key += (opt_opts['name'] || opt_opts['url']);
      mapopts = opt_opts;
      //alert(type + ' got object');
    }
  }

  var secure = 'https:' == document.location.protocol;
  var protocol = (secure ? 'https:' : 'http:');

  var tileProvider;

  switch (type) {
    case weapi.maps.MapType.OSM:
      if (!mapopts) {
        mapopts = {};
        mapopts['url'] = protocol + '//a.tile.openstreetmap.org';
      }
      tileProvider = new Cesium.OpenStreetMapImageryProvider(mapopts);
      break;
    case weapi.maps.MapType.BING:
      if (aropts) {
        mapopts = {};
        mapopts['url'] = protocol + '//dev.virtualearth.net';

        if (aropts[0] == 'Aerial')
          mapopts['mapStyle'] = Cesium.BingMapsStyle.AERIAL;
        if (aropts[0] == 'AerialWithLabels')
          mapopts['mapStyle'] = Cesium.BingMapsStyle.AERIAL_WITH_LABELS;
        if (aropts[0] == 'Road')
          mapopts['mapStyle'] = Cesium.BingMapsStyle.ROAD;

        mapopts['key'] = aropts[1];
      }
      tileProvider = new Cesium.BingMapsImageryProvider(mapopts);
      break;
    case weapi.maps.MapType.WMS:
      //tileProvider = new Cesium.WebMapServiceImageryProvider(mapopts);
      if (aropts) {
        mapopts = {};
        mapopts['parameters'] = {};
        mapopts['url'] = aropts[1];
        if (aropts[2] && aropts[2].length > 0) {
          mapopts['parameters']['version'] = aropts[2];
        }
        mapopts['layers'] = aropts[3];
        mapopts['parameters']['crs'] = aropts[4];
        if (aropts[5] && aropts[5].length > 0) {
          mapopts['parameters']['format'] = aropts[5];
        }
        if (aropts[6] && aropts[6].length > 0) {
          mapopts['parameters']['styles'] = aropts[6];
        }
        if (aropts[7] && aropts[7].length > 0) {
          var q = new goog.Uri.QueryData(aropts[7]);
          goog.array.forEach(q.getKeys(), function(el, i, arr) {
            mapopts['parameters'][el] = q.get(el);
          });
        }
        if (aropts[4] == 'EPSG:900913' ||
            aropts[4] == 'EPSG:3857') {
          mapopts['tilingScheme'] = new Cesium.WebMercatorTilingScheme();
        }
        // ignore minzoom aropts[8];
        mapopts['maximumLevel'] = aropts[9];
        if (app) mapopts['proxy'] = app.mapProxyObject;
      }
      tileProvider = new Cesium.WebMapServiceImageryProvider(mapopts);
      break;
    case weapi.maps.MapType.CUSTOM:
      if (aropts) {
        mapopts = {};
        mapopts['url'] = aropts[1];
        mapopts['maximumLevel'] = aropts[3];
        mapopts['tileSize'] = aropts[4];
        mapopts['flipY'] = aropts[5];
        mapopts['subdomains'] = aropts[6];
        mapopts['copyright'] = aropts[7];
        if (app) mapopts['proxy'] = app.mapProxyObject;
      }
      tileProvider = new weapi.CustomMap(mapopts);
      break;
    default:
      alert('Unknown MapType \'' + type + '\' !');
      return null;
      break;
  }

  var map = new weapi.Map(new Cesium.ImageryLayer(
      /** @type {!Cesium.ImageryProvider} */(tileProvider)));

  if (mapopts && mapopts['opacity']) {
    map.setOpacity(parseFloat(mapopts['opacity']));
  }
  if (mapopts && mapopts['bounds']) {
    var b = mapopts['bounds'];
    map.setBoundingBox(b[0], b[1], b[2], b[3]);
  }

  weapi.maps.mapMap.set(key, map);
  if (app) app.listenCORSErrors(map.layer.imageryProvider['errorEvent']);
  return map;
};


/**
 * @param {!weapi.maps.MapType} type Type of the map.
 * @param {string=} opt_subtype Optional subtype of the map.
 * @return {weapi.Map} TileProvider.
 */
weapi.maps.getMap = function(type, opt_subtype) {
  /** @type {string} */
  var key = type;
  if (goog.isDefAndNotNull(opt_subtype))
    key += opt_subtype;

  return /** @type {weapi.Map} */ (weapi.maps.mapMap.get(key));
};


/**
 * @param {!weapi.App} app .
 * Initializes maps that does not require any special parameters (keys etc.).
 */
weapi.maps.initStatics = function(app) {
  weapi.maps.initMap(app, weapi.maps.MapType.OSM);
};
