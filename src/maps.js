/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.maps');
goog.provide('weapi.maps.MapType');

goog.require('goog.structs.Map');

goog.require('weapi.Map');


/**
 * Constants for map names.
 * @enum {string}
 */
weapi.maps.MapType = {
  'MAPQUEST': 'mapquest',
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
 * @param {!weapi.maps.MapType} type Type of the map.
 * @param {...*} var_args Optional parameters to be passed to the TileProvider.
 * @return {weapi.Map} Initialized TileProvider.
 */
weapi.maps.initMap = function(type, var_args) {

  /** @type {string} */
  var key = type;
  if (goog.isDefAndNotNull(var_args) && var_args.length > 0)
    key += var_args[0];

  var tileProviderCtor;

  switch (type) {
    case weapi.maps.MapType.OSM:
    case weapi.maps.MapType.MAPQUEST:
      tileProviderCtor = Cesium.OpenStreetMapImageryProvider;
      break;
    case weapi.maps.MapType.BING:
      tileProviderCtor = Cesium.BingMapsImageryProvider;
      break;
    case weapi.maps.MapType.WMS:
      tileProviderCtor = Cesium.WebMapServiceImageryProvider;
      break;
    case weapi.maps.MapType.CUSTOM:
      tileProviderCtor = Cesium.TileMapServiceImageryProvider;
      break;
    default:
      alert('Unknown MapType \'' + type + '\' !');
      return null;
      break;
  }

  /*
   * This is a Proxy class for TileProvider which allows me to call TileProvider
   * constructors with var_args.
   */
  function construct(klass, var_args) {
    /**
     * @param {...*} var_args Arguments.
     * @constructor
     */
    function TPProxy(var_args) {
      klass.apply(this, var_args);
    };
    TPProxy.prototype = klass.prototype;
    return new TPProxy(var_args);
  }

  var tileProvider = construct(tileProviderCtor, var_args);

  var map = new weapi.Map(new Cesium.ImageryLayer(tileProvider));

  weapi.maps.mapMap.set(key, map);

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
 * Initializes maps that does not require any special parameters (keys etc.)
 */
weapi.maps.initStatics = function() {
  weapi.maps.initMap(weapi.maps.MapType.OSM);
};
