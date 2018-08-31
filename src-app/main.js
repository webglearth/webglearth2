/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapp.App');

goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.net.Jsonp');
goog.require('goog.userAgent');

goog.require('kt.OsmNamesAutocomplete');
goog.require('weapi.exports.App');



/**
 * @constructor
 */
weapp.App = function() {
  if (!weapi.App.detectWebGLSupport()) {
    window.location = '//www.webglearth.com/webgl-error.html';
  }

  var thkey = 'kSwrAdFeuIo6rD2Bm9dc';

  /**
   * @type {!weapi.exports.App}
   * @private
   */
  this.app_ = new weapi.exports.App('webglearthdiv', {
    'atmosphere': true,
    'sky': false,
    'terrain': 'https://maps.tilehosting.com/data/terrain-quantized-mesh/layer.json?key=' + thkey + '&',
    'terrainCredit': '', // suppress the html credit
    'position': [0, 0],
    'altitude': weapp.App.DEFAULT_ALT,
    'panning': true,
    'tilting': true,
    'zooming': true,
    'proxyHost': '//srtm.webglearth.com/cgi-bin/corsproxy.fcgi?url='
  });

  if (window.location.hash.length < 4) {
    new goog.net.Jsonp('https://freegeoip.klokantech.com/json/').send(
        undefined, goog.bind(function(data) {
          if (data) {
            var lat = data['latitude'], lng = data['longitude'];
            if (!isNaN(lat) && !isNaN(lng)) {
              this.app_.setPosition(lat, lng);
            }
          }
        }, this));
  }

  /**
   * @type {!goog.dom.ViewportSizeMonitor}
   * @private
   */
  this.vsm_ = new goog.dom.ViewportSizeMonitor();
  goog.events.listen(this.vsm_, goog.events.EventType.RESIZE, function(e) {
    this.resize_(this.vsm_.getSize());
  }, false, this);
  this.resize_(this.vsm_.getSize());

  var geocoderElement = /** @type {!Element} */
                        (goog.dom.getElement('geocoder'));

  var autocomplete = new kt.OsmNamesAutocomplete(geocoderElement,
    'https://geocoder.tilehosting.com/', 'oeGRMGLUngqm8fMN45zj');

  autocomplete.registerCallback(function(item) {
    console.log(item['boundingbox']);
    this.app_.flyToFitBounds(
      item['boundingbox'][1],
      item['boundingbox'][3],
      item['boundingbox'][0],
      item['boundingbox'][2]
    );
  }.bind(this));

  var initedMaps = {}; //cache
  var maptypeElement = /** @type {!HTMLSelectElement} */
                       (goog.dom.getElement('maptype'));
  var updateLayer = goog.bind(function() {
    var key = maptypeElement.options[maptypeElement.selectedIndex].value;
    switch (key) {
      default:
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.CUSTOM, {
            'url': 'https://maps.tilehosting.com/styles/' + key +
                '/{z}/{x}/{y}.png?key=' + thkey,
            'maximumLevel': 18,
            'copyright': '© MapTiler © OpenStreetMap contributors',
            'copyrightLink': 'https://www.maptiler.com/license/maps/'
          });
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
      case 'hybrid':
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.CUSTOM, {
            'url': 'https://maps.tilehosting.com/styles/hybrid' +
                '/{z}/{x}/{y}.jpg?key=' + thkey,
            'maximumLevel': 16,
            'copyright': '© MapTiler © OpenStreetMap contributors',
            'copyrightLink': 'https://www.maptiler.com/license/maps/'
          });
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
      case 'osm':
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.OSM);
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
    }
  }, this);
  goog.events.listen(maptypeElement, goog.events.EventType.CHANGE, updateLayer);
  updateLayer();

  /* HASH UPDATING & PARSING */

  /**
   * @type {string}
   * @private
   */
  this.lastCreatedHash_ = '';

  var updateHash = goog.bind(function() {
    var pos = this.app_.getPosition();
    var newhash = '#ll=' + pos[0].toFixed(5) + ',' + pos[1].toFixed(5) +
        ';alt=' + this.app_.getAltitude().toFixed(0);
    var head = this.app_.getHeading(), tilt = this.app_.getTilt();
    if (Math.abs(head) > 0.001) newhash += ';h=' + head.toFixed(3);
    if (Math.abs(tilt) > 0.001) newhash += ';t=' + tilt.toFixed(3);
    if (window.location.hash.toString() != newhash) {
      this.lastCreatedHash_ = newhash;
      window.location.hash = newhash;
    }
  }, this);

  var parseHash = goog.bind(function() {
    if (window.location.hash == this.lastCreatedHash_) return;
    var params = window.location.hash.substr(1).split(';');
    var getValue = function(name) {
      name += '=';
      var pair = goog.array.find(params, function(el, i, a) {
        return el.indexOf(name) === 0;});

      if (goog.isDefAndNotNull(pair)) {
        var value = pair.substr(name.length);
        if (value.length > 0)
          return value;
      }
      return undefined;
    };

    var ll = getValue('ll'), altitude = getValue('alt');
    var heading = getValue('h'), tilt = getValue('t');
    if (goog.isDefAndNotNull(ll)) {
      var llsplit = ll.split(',');
      if (llsplit.length > 1 && !isNaN(llsplit[0]) && !isNaN(llsplit[1])) {
        if (!altitude || isNaN(altitude)) altitude = weapp.App.DEFAULT_ALT;
        if (!tilt || isNaN(tilt)) tilt = 0;
        if (!heading || isNaN(heading)) heading = 0;
        this.app_.setPosition(parseFloat(llsplit[0]), parseFloat(llsplit[1]),
                              undefined, parseFloat(altitude),
                              parseFloat(heading), parseFloat(tilt));
      }
    }
  }, this);

  /**
   * @type {!goog.Timer}
   */
  this.hashUpdateTimer = new goog.Timer(2000);
  goog.events.listen(this.hashUpdateTimer, goog.Timer.TICK, updateHash);
  this.hashUpdateTimer.start();

  goog.events.listen(window, goog.events.EventType.HASHCHANGE, parseHash);

  parseHash();

  if (goog.userAgent.MOBILE || goog.userAgent.ANDROID ||
      goog.userAgent.IPHONE || goog.userAgent.IPAD) {
    var hideAddressBar = function() {
      if (document.documentElement.scrollHeight <
          window.outerHeight / window.devicePixelRatio)
        document.documentElement.style.height =
            (window.outerHeight / window.devicePixelRatio) + 'px';
      setTimeout(window.scrollTo(1, 1), 0);
    };
    goog.events.listen(window, 'orientationchange', hideAddressBar);
    hideAddressBar();
  } else {
    geocoderElement.focus();
  }
};


/**
 * @define {number} default altitude in meters.
 */
weapp.App.DEFAULT_ALT = 17000000;


/**
 * @param {?goog.math.Size} size
 * @private
 */
weapp.App.prototype.resize_ = function(size) {
  if (!size) return;
  this.app_.handleResize();
};

goog.exportSymbol('WebGLEarth', weapp.App);
