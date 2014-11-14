/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.markers.PolyDragger');

goog.require('goog.dom');
goog.require('goog.style');

goog.require('weapi.markers.AbstractMarker');
goog.require('weapi.utils');



/**
 * @inheritDoc
 * @param {number} lat .
 * @param {number} lon .
 * @param {!weapi.App} app .
 * @param {?number} fixedId .
 * @param {!function(number, number, number)} updateFunc .
 * @param {!function(number)} deleteFunc .
 * @param {(function(number, number) : number)=} opt_createFunc .
 * @extends {weapi.markers.AbstractMarker}
 * @constructor
 */
weapi.markers.PolyDragger = function(lat, lon, app, fixedId,
                                     updateFunc, deleteFunc, opt_createFunc) {
  var marker = goog.dom.createDom('div', {'class':
        'we-polydragger-' + (goog.isDefAndNotNull(fixedId) ? 'a' : 'b')});

  goog.base(this, lat, lon, /** @type {!HTMLElement} */ (marker));

  this.show(false);

  goog.events.listen(marker, goog.events.EventType.MOUSEDOWN, function(e_) {
    if (e_.button == 0) {
      goog.events.listen(app.canvas,
          goog.events.EventType.MOUSEMOVE, function(e) {
            var carte = app.camera.camera.
                pickEllipsoid(new Cesium.Cartesian2(e.offsetX, e.offsetY));
            if (goog.isDefAndNotNull(carte)) {
              var carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(carte);
              this.lat = goog.math.toDegrees(carto.latitude);
              this.lon = goog.math.toDegrees(carto.longitude);
              this.setXY(e.offsetX, e.offsetY); //for smoother dragging
              if (goog.isDefAndNotNull(fixedId)) {
                updateFunc(fixedId, this.lat, this.lon);
              } else if (opt_createFunc) {
                fixedId = opt_createFunc(this.lat, this.lon);
                marker.className = 'we-polydragger-a';
              }
              e.preventDefault();
            }
          }, false, this);
      e_.preventDefault();
    }
  }, false, this);

  goog.events.listen(marker, goog.events.EventType.CLICK, function(e) {
    if (e.altKey && goog.isDefAndNotNull(fixedId)) {
      deleteFunc(fixedId);
      e.preventDefault();
    }
  }, false, this);

  goog.events.listen(marker, goog.events.EventType.MOUSEUP, function(e) {
    goog.events.removeAll(app.canvas,
                          goog.events.EventType.MOUSEMOVE);
  }, false, this);
};
goog.inherits(weapi.markers.PolyDragger, weapi.markers.AbstractMarker);


weapi.utils.installStyles(
    '.we-polydragger-a{position:absolute;width:8px;height:8px;z-index:100;' +
    'margin-left:-4px;margin-top:-4px;background-color:#36f;' +
    'cursor:pointer;border:1px solid blue;}'
);
weapi.utils.installStyles(
    '.we-polydragger-b{position:absolute;width:6px;height:6px;z-index:99;' +
    'margin-left:-3px;margin-top:-3px;background-color:rgba(180,220,250,0.9);' +
    'cursor:pointer;border:1px solid blue;}'
);
