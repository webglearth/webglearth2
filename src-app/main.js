/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapp.App');

goog.require('goog.dom.ViewportSizeMonitor');

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
