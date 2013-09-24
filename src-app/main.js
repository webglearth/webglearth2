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

goog.require('klokantech.Nominatim');
goog.require('weapi.exports.App');



/**
 * @constructor
 */
weapp.App = function() {
  /**
   * @type {!weapi.exports.App}
   * @private
   */
  this.app_ = new weapi.exports.App('webglearthdiv', {
    atmosphere: true,
    sky: false,
    position: [0, 0],
    altitude: 7000000,
    panning: true,
    tilting: true,
    zooming: true,
    proxyHost: 'http://srtm.webglearth.com/cgi-bin/corsproxy.fcgi?url='
  });

  /**
   * @type {!goog.dom.ViewportSizeMonitor}
   * @private
   */
  this.vsm_ = new goog.dom.ViewportSizeMonitor();
  goog.events.listen(this.vsm_, goog.events.EventType.RESIZE, function(e) {
    this.resize_(this.vsm_.getSize());
  }, false, this);
  this.resize_(this.vsm_.getSize());

  var geocoderElement = goog.dom.getElement('geocoder');
  geocoderElement.focus();
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
};


/**
 * @param {?goog.math.Size} size
 * @private
 */
weapp.App.prototype.resize_ = function(size) {
  if (!size) return;
  this.app_.handleResize();
};

goog.exportSymbol('WebGLEarth', weapp.App);
