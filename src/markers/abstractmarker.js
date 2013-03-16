/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.markers.AbstractMarker');

goog.require('goog.dom');



/**
 * @param {number} lat Latitude to be displayed at.
 * @param {number} lon Longitude to be displayed at.
 * @param {!HTMLElement} element Element representing this marker.
 * @constructor
 */
weapi.markers.AbstractMarker = function(lat, lon, element) {
  /**
   * @type {number}
   */
  this.lat = lat;

  /**
   * @type {number}
   */
  this.lon = lon;

  /**
   * @type {!HTMLElement}
   * @protected
   */
  this.element = element;

  /**
   * @type {Element}
   * @protected
   */
  this.parentElement = null;

  /**
   * @type {boolean}
   * @protected
   */
  this.enabled = true;

  /**
   * @type {boolean}
   * @protected
   */
  this.visible = false;
};


/**
 * Attaches this marker to given element.
 * Detaches if already attached somewhere else.
 * @param {!Element} parentElement Element to attach to.
 */
weapi.markers.AbstractMarker.prototype.attach = function(parentElement) {
  if (this.parentElement) {
    this.detach();
  }
  this.parentElement = parentElement;
  this.show(true);
};


/**
 * Detaches this marker from it's parent
 */
weapi.markers.AbstractMarker.prototype.detach = function() {
  if (this.parentElement) {
    this.show(false);
    this.parentElement = null;
  }
};


/**
 * Enables/disables the marker.
 * @param {boolean=} opt_enabled Whether this marker is enabled or not.
 *                               Default true.
 */
weapi.markers.AbstractMarker.prototype.enable = function(opt_enabled) {
  this.enabled = opt_enabled || false;
  if (!this.enabled) this.show(false);
};


/**
 * @return {boolean} Whether this marker is enabled or not.
 */
weapi.markers.AbstractMarker.prototype.isEnabled = function() {
  return this.enabled;
};


/**
 * @return {boolean} Whether this marker is enabled or not.
 */
weapi.markers.AbstractMarker.prototype.isVisible = function() {
  return this.visible;
};


/**
 * Shows/hides the marker.
 * @param {boolean=} opt_visible Whether this marker is visible or not.
 *                               Default true.
 */
weapi.markers.AbstractMarker.prototype.show = function(opt_visible) {
  var newVal = !(opt_visible === false);
  var change = !(this.visible == newVal);
  this.visible = newVal;

  if (change) {
    if (this.visible && this.parentElement) {
      goog.dom.appendChild(this.parentElement, this.element);
    } else {
      goog.dom.removeNode(this.element);
    }
  }
};


/**
 *
 * @param {number} x X.
 * @param {number} y Y.
 */
weapi.markers.AbstractMarker.prototype.setXY = function(x, y) {
  this.element.style.left = x.toFixed() + 'px';
  this.element.style.top = y.toFixed() + 'px';
  if (this.enabled) this.show(true);
};


/**
 * Override this method, if you want your marker
 * to be renderable onto 2d canvas for screenshot purposes.
 * @param {!CanvasRenderingContext2D} ctx .
 */
weapi.markers.AbstractMarker.prototype.draw2D = goog.nullFunction;
