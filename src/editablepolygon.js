/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.EditablePolygon');

goog.require('goog.color');

goog.require('weapi.PolyIcon');
goog.require('weapi.Polygon');
goog.require('weapi.markers.PolyDragger');



/**
 * @param {!weapi.App} app .
 * @param {!weapi.markers.MarkerManager} markermanager MarkerManager to use.
 * @constructor
 */
weapi.EditablePolygon = function(app, markermanager) {
  /**
   * @type {!weapi.App}
   * @protected
   */
  this.app = app;

  /**
   * @type {!weapi.markers.MarkerManager}
   * @private
   */
  this.markermanager_ = markermanager;

  /**
   * @type {!weapi.Polygon}
   * @private
   */
  this.polygon_ = new weapi.Polygon();

  this.app.addPrimitive(this.polygon_.primitive);
  this.app.addPrimitive(this.polygon_.primitiveLineCol);
  this.app.sceneChanged = true;

  /**
   * @type {!Object.<number, string>}
   * @private
   */
  this.draggers_ = {};

  /**
   * @type {!Object.<number, !weapi.markers.PolyDragger>}
   * @private
   */
  this.midMap_ = {};

  /**
   * @type {!Object.<number, string>}
   * @private
   */
  this.midDraggers_ = {};

  /**
   * @type {goog.events.ListenableKey|null|number}
   * @private
   */
  this.clickListenKey_ = null;

  /**
   * @type {!weapi.PolyIcon}
   * @private
   */
  this.icon_ = new weapi.PolyIcon(0, 0, this.app);
  //this.icon_.setImage('47.png', 100);

  /**
   * @type {!function()}
   * @private
   */
  this.onchange_ = goog.nullFunction;

  /**
   * @type {number}
   * @private
   */
  this.lastClickToAdd_ = 0;
};


/**
 */
weapi.EditablePolygon.prototype.destroy = function() {
  this.disableClickToAdd();
  this.app.removePrimitive(this.polygon_.primitive);
  this.app.removePrimitive(this.polygon_.primitiveLineCol);
  this.app.sceneChanged = true;
  this.onchange_ = goog.nullFunction;
  this.icon_.destroy();
  goog.object.forEach(this.midDraggers_, function(el, key, obj) {
    this.markermanager_.removeMarker(el);
  }, this);
  goog.object.forEach(this.draggers_, function(el, key, obj) {
    this.markermanager_.removeMarker(el);
  }, this);
  delete this.midMap_;
  delete this.polygon_;
};


/**
 */
weapi.EditablePolygon.prototype.enableClickToAdd = function() {
  if (goog.isDefAndNotNull(this.clickListenKey_)) return;
  // when mouse is down, wait for mouseup and check, if it wasn't a dragging..
  this.clickListenKey_ = goog.events.listen(this.app.canvas,
      goog.events.EventType.MOUSEDOWN, function(e) {
        goog.events.listenOnce(this.app.canvas,
            goog.events.EventType.MOUSEUP, function(e_) {
              if (e_.button == 0 && !goog.isNull(this.clickListenKey_)) {
                if (Math.max(Math.abs(e.offsetX - e_.offsetX),
                    Math.abs(e.offsetY - e_.offsetY)) <= 3) {
                  var cartesian = this.app.camera.camera.pickEllipsoid(
                      new Cesium.Cartesian2(e_.offsetX, e_.offsetY));
                  if (goog.isDefAndNotNull(cartesian)) {
                    var carto = Cesium.Ellipsoid.WGS84.
                        cartesianToCartographic(cartesian);
                    this.addPoint(goog.math.toDegrees(carto.latitude),
                                  goog.math.toDegrees(carto.longitude));
                    e_.preventDefault();
                    this.lastClickToAdd_ = goog.now();
                  }
                }
              }
            }, false, this);
      }, false, this);
};


/**
 */
weapi.EditablePolygon.prototype.disableClickToAdd = function() {
  goog.events.unlistenByKey(this.clickListenKey_);
  this.clickListenKey_ = null;
};


/**
 * @param {string} hexColor #rrggbb.
 * @param {number=} opt_a [0-1], defaults to 1.
 */
weapi.EditablePolygon.prototype.setFillColor = function(hexColor, opt_a) {
  hexColor = goog.color.normalizeHex(hexColor);
  var r = parseInt(hexColor.substr(1, 2), 16) / 255;
  var g = parseInt(hexColor.substr(3, 2), 16) / 255;
  var b = parseInt(hexColor.substr(5, 2), 16) / 255;

  this.polygon_.primitive.material.uniforms['color'] =
      new Cesium.Color(r, g, b, opt_a);

  this.app.sceneChanged = true;
};


/**
 * @param {string} hexColor #rrggbb.
 * @param {number=} opt_a [0-1], defaults to 1.
 */
weapi.EditablePolygon.prototype.setStrokeColor = function(hexColor, opt_a) {
  hexColor = goog.color.normalizeHex(hexColor);
  var r = parseInt(hexColor.substr(1, 2), 16) / 255;
  var g = parseInt(hexColor.substr(3, 2), 16) / 255;
  var b = parseInt(hexColor.substr(5, 2), 16) / 255;

  this.polygon_.primitiveLine.material.uniforms['color'] =
      new Cesium.Color(r, g, b, opt_a);

  this.app.sceneChanged = true;
};


/**
 * @param {string} src URL of the image to use.
 * @param {number} width Desired width of the image in meters.
 * @param {number} height Desired height of the image in meters.
 */
weapi.EditablePolygon.prototype.setIcon = function(src, width, height) {
  this.icon_.setImage(src, width, height);
  this.repositionIcon_();
  this.app.sceneChanged = true;
};


/**
 * @param {!function()} onchange Function to be called whenever polygon changes.
 */
weapi.EditablePolygon.prototype.setOnChange = function(onchange) {
  this.onchange_ = onchange;
};


/**
 * @return {boolean} Is the polygon valid (non self-intersecting,...) ?
 */
weapi.EditablePolygon.prototype.isValid = function() {
  return this.polygon_.isValid();
};


/**
 * @return {number} Rough area of the polygon in m^2.
 */
weapi.EditablePolygon.prototype.getRoughArea = function() {
  return this.polygon_.getRoughArea();
};


/**
 * in degrees
 * @return {{lat: number, lng: number}|null}
 *                                 Centroid of the polygon or null if not valid.
 */
weapi.EditablePolygon.prototype.getCentroid = function() {
  var centroid = this.polygon_.calcCentroid();
  return {'lat': centroid[1], 'lng': centroid[0]};
};


/**
 * in degrees
 * @param {number} lat .
 * @param {number} lng .
 * @return {boolean} True if inside the polygon.
 */
weapi.EditablePolygon.prototype.isPointIn = function(lat, lng) {
  //workaround: the mousedown/up events cause point adding,
  // but the click event can not be easily canceled so
  // it always causes polygon selection when click-to-adding
  if (goog.now() - this.lastClickToAdd_ < 100) return false;
  return this.polygon_.isPointIn(lat, lng);
};


/**
 * @param {!weapi.EditablePolygon} other .
 * @return {boolean} True if the two polygons overlap.
 */
weapi.EditablePolygon.prototype.intersects = function(other) {
  return this.polygon_.intersects(other.polygon_);
};


/**
 * @private
 */
weapi.EditablePolygon.prototype.repositionIcon_ = function() {
  var avg = this.polygon_.calcCentroid() || this.polygon_.calcAverage();

  this.icon_.setLatLng(goog.math.toRadians(avg[1]),
                       goog.math.toRadians(avg[0]));
  this.icon_.enable(this.polygon_.isValid());
};


/**
 * @param {boolean} visible .
 * @param {boolean=} opt_midOnly .
 */
weapi.EditablePolygon.prototype.showDraggers = function(visible, opt_midOnly) {
  goog.object.forEach(this.midMap_, function(el, key, obj) {
    el.enable(visible);
  }, this);
  if (opt_midOnly !== true) {
    goog.object.forEach(this.draggers_, function(el, key, obj) {
      this.markermanager_.getMarker(el).enable(visible);
    }, this);
  }
  this.app.sceneChanged = true;
};


/**
 * @return {!Array.<!{lat: number, lng: number}>} .
 */
weapi.EditablePolygon.prototype.getPoints = function() {
  return this.polygon_.getAllCoords();
};


/**
 * Recalculates position of the two mid-edge draggers neighboring given point.
 * @param {number} fixedId .
 * @private
 */
weapi.EditablePolygon.prototype.repositionMidsAround_ = function(fixedId) {
  var neighs = this.polygon_.getNeighbors(fixedId);
  if (neighs.length > 0) {
    var coordsPrev = this.polygon_.getCoords(neighs[0]);
    var coordsHere = this.polygon_.getCoords(fixedId);
    var coordsNext = this.polygon_.getCoords(neighs[1]);
    this.midMap_[fixedId].lat =
        goog.math.toRadians((coordsHere[1] + coordsNext[1]) / 2);
    this.midMap_[fixedId].lon =
        goog.math.toRadians((coordsHere[0] + coordsNext[0]) / 2);
    this.midMap_[neighs[0]].lat =
        goog.math.toRadians((coordsPrev[1] + coordsHere[1]) / 2);
    this.midMap_[neighs[0]].lon =
        goog.math.toRadians((coordsPrev[0] + coordsHere[0]) / 2);
  }
  this.app.sceneChanged = true;
};


/**
 * Checks, whether the polygon has just changed CW/CCW orientation
 * and performs necessary adjustments.
 * @private
 */
weapi.EditablePolygon.prototype.checkPointOrientationChange_ = function() {
  if (this.polygon_.orientationChanged()) {
    goog.object.forEach(this.midMap_, function(el, key, obj) {
      this.repositionMidsAround_(key);
    }, this);
  }
};


/**
 * @param {!Array.<number>} coords
 */
weapi.EditablePolygon.prototype.addPoints = function(coords) {
  var l = coords.length;
  for (var i = 0; i < l - 1; i++) {
    this.addPoint(coords[i][0], coords[i][1], undefined, undefined, true);
  }
  this.addPoint(coords[i][0], coords[i][1]);
};


/**
 * @param {number} lat in degrees.
 * @param {number} lng in degrees.
 * @param {number=} opt_parent .
 * @param {boolean=} opt_fromMid .
 * @param {boolean=} opt_more More points coming?
 * @return {number} fixedId.
 */
weapi.EditablePolygon.prototype.addPoint = function(lat, lng,
                                                    opt_parent, opt_fromMid,
                                                    opt_more) {
  var fixedId = this.polygon_.addPoint(lat, lng, opt_parent, opt_more);

  if (opt_fromMid && goog.isDefAndNotNull(opt_parent)) {
    this.draggers_[fixedId] = this.midDraggers_[opt_parent];
    delete this.midDraggers_[opt_parent];
  } else {
    var dragger = new weapi.markers.PolyDragger(
        goog.math.toRadians(lat), goog.math.toRadians(lng), this.app, fixedId,
        goog.bind(this.movePoint, this), goog.bind(this.removePoint, this));
    this.draggers_[fixedId] = this.markermanager_.addMarker(null, dragger);
  }
  this.repositionIcon_();

  var neighs = this.polygon_.getNeighbors(fixedId);
  if (neighs.length > 0) {
    var adderAfter = goog.bind(function(parentP) {
      return goog.bind(function(lat, lng) {
        return this.addPoint(lat, lng, parentP, true);
      }, this);
    }, this);
    var mid1 = new weapi.markers.PolyDragger(
        goog.math.toRadians(lat), goog.math.toRadians(lng), this.app, null,
        goog.bind(this.movePoint, this),
        goog.bind(this.removePoint, this),
        adderAfter(fixedId));
    this.midMap_[fixedId] = mid1;
    this.midDraggers_[fixedId] = this.markermanager_.addMarker(null, mid1);

    if (opt_fromMid) {
      var mid2 = new weapi.markers.PolyDragger(
          goog.math.toRadians(lat), goog.math.toRadians(lng), this.app, null,
          goog.bind(this.movePoint, this),
          goog.bind(this.removePoint, this),
          adderAfter(neighs[0]));
      this.midMap_[neighs[0]] = mid2;
      this.midDraggers_[neighs[0]] = this.markermanager_.addMarker(null, mid2);
    }
    this.repositionMidsAround_(neighs[0]);
    this.repositionMidsAround_(fixedId);
    this.repositionMidsAround_(neighs[1]);
  }

  this.checkPointOrientationChange_();
  this.onchange_();

  this.app.sceneChanged = true;

  return fixedId;
};


/**
 * @param {number} fixedId .
 * @param {number} lat in degrees.
 * @param {number} lng in degrees.
 */
weapi.EditablePolygon.prototype.movePoint = function(fixedId, lat, lng) {
  this.polygon_.movePoint(fixedId, lat, lng);
  var marker = this.markermanager_.getMarker(this.draggers_[fixedId]);
  marker.lat = goog.math.toRadians(lat);
  marker.lon = goog.math.toRadians(lng);
  this.checkPointOrientationChange_();
  this.repositionMidsAround_(fixedId);
  this.repositionIcon_();

  this.app.sceneChanged = true;

  this.onchange_();
};


/**
 * @param {number} fixedId .
 */
weapi.EditablePolygon.prototype.removePoint = function(fixedId) {
  var neighs = this.polygon_.getNeighbors(fixedId);

  this.polygon_.removePoint(fixedId);

  this.repositionIcon_();
  if (goog.isDefAndNotNull(this.draggers_[fixedId])) {
    this.markermanager_.removeMarker(this.draggers_[fixedId]);
    delete this.draggers_[fixedId];

    delete this.midMap_[fixedId];
    if (goog.isDefAndNotNull(this.midDraggers_[fixedId])) {
      this.markermanager_.removeMarker(this.midDraggers_[fixedId]);
      delete this.midDraggers_[fixedId];
    }
  }

  this.checkPointOrientationChange_();

  if (neighs.length > 0) {
    this.repositionMidsAround_(neighs[0]);
    this.repositionMidsAround_(fixedId);
    this.repositionMidsAround_(neighs[1]);
  }

  this.app.sceneChanged = true;

  this.onchange_();
};
