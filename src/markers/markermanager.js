/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.markers.MarkerManager');

goog.require('goog.structs.Map');

goog.require('weapi.markers.AbstractMarker');
goog.require('weapi.utils');



/**
 * @param {!weapi.App} app .
 * @param {!Element} element Element where markers should be
 *                           created and positioned.
 * @constructor
 */
weapi.markers.MarkerManager = function(app, element) {
  /**
   * @type {!weapi.App}
   * @private
   */
  this.app_ = app;

  /**
   * @type {!Element}
   * @private
   */
  this.element_ = element;

  /**
   * @type {!goog.structs.Map}
   * @private
   */
  this.markerMap_ = new goog.structs.Map();
};


/**
 * Adds marker.
 * @param {?string} key Key of the marker. If null, random string is generated.
 * @param {!weapi.markers.AbstractMarker} marker Marker to be added.
 * @return {string} Key that was actually used.
 */
weapi.markers.MarkerManager.prototype.addMarker = function(key, marker) {
  var realKey = key || goog.string.getRandomString();
  marker.attach(this.element_);
  this.markerMap_.set(realKey, marker);
  return realKey;
};


/**
 * Returns marker with the given key.
 * @param {string} key Key of the marker.
 * @return {weapi.markers.AbstractMarker} Marker or undefined if key is
 *                                        not present in the collection.
 */
weapi.markers.MarkerManager.prototype.getMarker = function(key) {
  return /** @type {weapi.markers.AbstractMarker}*/ (this.markerMap_.get(key));
};


/**
 * Removes marker, does NOT dispose of it.
 * @param {string} key Key of the marker.
 * @return {weapi.markers.AbstractMarker} Marker that was removed or undefined
 *                                        if key was not present.
 */
weapi.markers.MarkerManager.prototype.removeMarker = function(key) {
  var marker = /** @type {weapi.markers.AbstractMarker}*/
      (this.markerMap_.get(key));
  if (goog.isDef(marker)) {
    marker.detach();
    this.markerMap_.remove(key);
  }
  return marker;
};


/**
 * Removes marker, does NOT dispose of it.
 * @param {weapi.markers.AbstractMarker} marker .
 */
weapi.markers.MarkerManager.prototype.removeMarkerEx = function(marker) {
  goog.structs.forEach(this.markerMap_, function(val, key, col) {
    if (val == marker) this.removeMarker(key);
  }, this);
};


/**
 * Updates all markers it controls.
 */
weapi.markers.MarkerManager.prototype.updateMarkers = function() {
  goog.array.forEach(this.markerMap_.getKeys(), this.updateMarker, this);
};


/**
 * Updates all markers it controls.
 * @param {string} key Key of marker to update.
 */
weapi.markers.MarkerManager.prototype.updateMarker = function(key) {
  var marker = /** @type {weapi.markers.AbstractMarker}*/
      (this.markerMap_.get(key));

  if (marker.isEnabled()) {
    //window['console']['log'](marker.lat, marker.lon);
    var pos = weapi.utils.getXYForLatLng(this.app_,
                                         marker.lat, marker.lon);
    //window['console']['log'](pos);
    //window.title = pos;
    if (goog.isDefAndNotNull(pos)) {
      marker.setXY(pos[0], pos[1]);
      marker.show(pos[2] > 0);
    } else {
      marker.show(false);
    }
  }
};


/**
 * @param {function(!weapi.markers.AbstractMarker)} func Callback.
 */
weapi.markers.MarkerManager.prototype.forEach = function(func) {
  goog.array.forEach(this.markerMap_.getKeys(), function(el, i, arr) {
    var marker = /** @type {weapi.markers.AbstractMarker}*/
        (this.markerMap_.get(el));
    if (marker) func(marker);
  }, this);
};
