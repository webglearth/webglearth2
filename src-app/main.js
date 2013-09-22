/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapp.App');

goog.require('weapi.exports.App');



/**
 * @constructor
 */
weapp.App = function() {
  this.app = new weapi.exports.App('webglearthdiv', {
    atmosphere: true,
    sky: false,
    position: [0, 0],
    altitude: 7000000,
    panning: true,
    tilting: true,
    zooming: true,
    proxyHost: 'http://srtm.webglearth.com/cgi-bin/corsproxy.fcgi?url='
  });
};
goog.exportSymbol('WebGLEarth', weapp.App);
