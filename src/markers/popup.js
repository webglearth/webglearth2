/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.markers.Popup');

goog.require('goog.dom');
goog.require('goog.style');

goog.require('weapi.utils');



/**
 * @param {string} contentHTML HTML content of the popup.
 * @param {number=} opt_maxWidth Maximal width of the popup (default = 300).
 * @param {boolean=} opt_closeButton Create close button? (default = true).
 * @constructor
 */
weapi.markers.Popup = function(contentHTML, opt_maxWidth, opt_closeButton) {


  var content = goog.dom.createDom('div', {'class': 'we-pp-content'});
  content.innerHTML = contentHTML;

  var contentwrap = goog.dom.createDom('div',
                                       {'class': 'we-pp-wrapper'}, content);

  var tipcontainer = goog.dom.createDom(
      'div', {'class': 'we-pp-tip-cont'},
      goog.dom.createDom('div', {'class': 'we-pp-tip'}));

  /**
   * @type {!HTMLElement}
   * @private
   */
  this.popup_ = /** @type {!HTMLElement} */
      (goog.dom.createDom('div', {'class': 'we-pp'}));

  if (opt_closeButton !== false) {
    var closebutton = goog.dom.createDom('a',
                                         {'class': 'we-pp-close', 'href': '#'});
    closebutton.onclick = goog.bind(this.show, this, false);
    goog.dom.appendChild(this.popup_, closebutton);
  }
  goog.dom.appendChild(this.popup_, contentwrap);
  goog.dom.appendChild(this.popup_, tipcontainer);

  var width = (opt_maxWidth || 300) + 2 * 20; // compensation for margin+border
  this.popup_.style.width = width.toFixed(0) + 'px';
  this.popup_.style.left = (-width / 2).toFixed(0) + 'px';

  this.show(false);
};


/**
 * @return {!HTMLElement} Element.
 */
weapi.markers.Popup.prototype.getElement = function() {
  return this.popup_;
};


/**
 * Adjust some properties of this popup.
 * @param {number} markerHeight Height of the marker this popup is attached to.
 */
weapi.markers.Popup.prototype.adjust = function(markerHeight) {
  this.popup_.style.bottom = markerHeight.toFixed(0) + 'px';
};


/**
 * Shows or hides the popup.
 * @param {boolean=} opt_visible Visible? If not given, toggle.
 */
weapi.markers.Popup.prototype.show = function(opt_visible) {
  var visible = goog.isDefAndNotNull(opt_visible) ?
                    opt_visible : parseFloat(this.popup_.style.opacity) !== 1;
  if (visible) {
    this.popup_.style.opacity = 1.0;
    this.popup_.style.visibility = 'visible';
  } else {
    this.popup_.style.opacity = 0.0;

    //this breaks the fade-out animation, but is important to fix dragging
    //TODO: timeout and then visibility:hidden ?
    this.popup_.style.visibility = 'hidden';
  }
};


weapi.utils.installStyles(
    '.we-pp-content p{margin:18px 0;text-align:justify;}' +
    '.we-pp-wrapper{padding:1px;text-align:left;border-radius:12px;}' +
    '.we-pp{z-index:100;-webkit-transition:opacity 0.2s linear;' +
    '-moz-transition:opacity 0.2s linear;-o-transition:opacity 0.2s linear;' +
    'transition:opacity 0.2s linear;position:absolute;}' +
    '.we-pp-wrapper,.we-pp-tip{background:white;box-shadow:0 1px 10px #888;' +
    '-moz-box-shadow:0 1px 10px #888;-webkit-box-shadow:0 1px 14px #999;}' +
    '.we-pp-close{background-image:url(data:image/png;base64,iVBORw0KGgoAAAAN' +
    'SUhEUgAAAAoAAAAKCAMAAAC67D+PAAAAk1BMVEX////Ny8vNy8vNy8vNy8vNy8vNy8vNy8vN' +
    'y8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vN' +
    'y8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vNy8vN' +
    'y8vNy8vNy8vNy8vNy8sw0horAAAAMHRSTlMA/bGBFK1LgjellwUx2+VZo73SE6z5fQYOtzLR' +
    'pxI22CC4g6ieV+yAEc8/ZocEHTzU+GNbAAAAV0lEQVQI1wXBBQKDMADAwLRl7szdgCks/3/d' +
    '7hh0ehl0W21IwZgNR44nTNVZribmC1WXqzVstmpIALu9Gg5HOJ1VNV64arjd1YKy8sEz+nrD' +
    '51tD0//xB/w6CnrIHetcAAAAAElFTkSuQmCC);position:absolute;top:9px;' +
    'right:9px;width:10px;height:10px;overflow:hidden;}' +
    '.we-pp-content{display:inline-block;margin:13px 19px;' +
    'font:12px/1.4 "Helvetica Neue",Arial,Helvetica,sans-serif;}' +
    '.we-pp-tip-cont{margin:0 auto;width:40px;height:16px;position:relative;' +
    'overflow:hidden;}' +
    '.we-pp-tip{width:15px;height:15px;padding:1px;margin:-8px auto 0;' +
    '-moz-transform:rotate(45deg);-webkit-transform:rotate(45deg);' +
    '-o-transform:rotate(45deg);transform:rotate(45deg);}'
);
