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
goog.require('goog.userAgent');

goog.require('klokantech.Nominatim');
goog.require('weapi.exports.App');



/**
 * @constructor
 */
weapp.App = function() {
  if (!weapi.App.detectWebGLSupport()) {
    window.location = 'http://www.webglearth.com/webgl-error.html';
  }

  /**
   * @type {!weapi.exports.App}
   * @private
   */
  this.app_ = new weapi.exports.App('webglearthdiv', {
    'atmosphere': true,
    'sky': false,
    'position': [0, 0],
    'altitude': weapp.App.DEFAULT_ALT,
    'panning': true,
    'tilting': true,
    'zooming': true,
    'proxyHost': 'http://srtm.webglearth.com/cgi-bin/corsproxy.fcgi?url='
  });

  if (window.location.hash.length < 4) {
    new goog.net.Jsonp('http://freegeoip.net/json/').send(
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
  var ac = new klokantech.Nominatim(geocoderElement);

  goog.events.listen(ac, goog.ui.ac.AutoComplete.EventType.UPDATE, function(e) {
    var ext = e.row['bounds'] || e.row['viewport'];
    this.app_.flyToFitBounds(ext[1], ext[3], ext[0], ext[2]);
  }, false, this);

  var geocoder_search = goog.bind(function(event) {
    goog.events.Event.preventDefault(event);
    ac.search(geocoderElement.value, 1, goog.bind(function(tok, results) {
      var ext = results[0]['bounds'] || results[0]['viewport'];
      this.app_.flyToFitBounds(ext[1], ext[3], ext[0], ext[2]);
    }, this));
  }, this);
  var form = goog.dom.getAncestorByTagNameAndClass(geocoderElement,
                                                   goog.dom.TagName.FORM);
  goog.events.listen(form, 'submit', geocoder_search);
  goog.events.listen(geocoderElement,
                     ['webkitspeechchange', 'speechchange'], geocoder_search);

  var initedMaps = {}; //cache
  var maptypeElement = /** @type {!HTMLSelectElement} */
                       (goog.dom.getElement('maptype'));
  goog.events.listen(maptypeElement, goog.events.EventType.CHANGE, function(e) {
    var key = maptypeElement.options[maptypeElement.selectedIndex].value;
    switch (key) {
      case 'bing_aerial':
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.BING,
              ['Aerial', weapp.App.BING_KEY]);
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
      case 'bing_roads':
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.BING,
              ['Road', weapp.App.BING_KEY]);
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
      case 'bing_aerialwl':
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.BING,
              ['AerialWithLabels', weapp.App.BING_KEY]);
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
      case 'mapquest':
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.MAPQUEST);
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
      case 'osm':
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.OSM);
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
      default:
        break;
    }
  }, false, this);

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
 * @define {string} bing key.
 */
weapp.App.BING_KEY =
    'AsLurrtJotbxkJmnsefUYbatUuBkeBTzTL930TvcOekeG8SaQPY9Z5LDKtiuzAOu';


/**
 * @define {number} default altitude in meters.
 */
weapp.App.DEFAULT_ALT = 7000000;


/**
 * @param {?goog.math.Size} size
 * @private
 */
weapp.App.prototype.resize_ = function(size) {
  if (!size) return;
  this.app_.handleResize();
};

goog.exportSymbol('WebGLEarth', weapp.App);
