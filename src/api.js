/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi');
goog.provide('weapi.exports.App');
goog.provide('weapi.exports.Map');
goog.provide('weapi.exports.Maps');
goog.provide('weapi.exports.Marker');
goog.provide('weapi.exports.Polygon');

goog.require('goog.math');

goog.require('we.canvas2image');
goog.require('weapi.App');
goog.require('weapi.EditablePolygon');
goog.require('weapi.Map');
goog.require('weapi.MiniGlobe');


//TODO: polygons -- new polyicons


/**
 * @define {boolean} Generate exports?
 */
weapi.GENERATE_EXPORTS = true;

var exportSymbol = function(symbol, obj) {
  if (weapi.GENERATE_EXPORTS) goog.exportSymbol(symbol, obj);
};



/**
 * @param {string} divid .
 * @param {Object=} opt_options Application options.
 * @constructor
 */
weapi.exports.App = weapi.App;
exportSymbol('WebGLEarth', weapi.exports.App);

exportSymbol('WebGLEarth.isSupported', weapi.exports.App.detectWebGLSupport);


////////////////////////////////////////////////////////////////////////////////
/* Camera manipulation */


/**
 * @param {number} alt
 */
weapi.exports.App.prototype.setAltitude = function(alt) {
  var cam = this.camera;
  cam.animator.cancel();

  var heading = cam.getHeading();
  var tilt = cam.getTilt();

  cam.setPos(undefined, undefined, alt);
  cam.setHeadingAndTilt(heading, tilt);
};
exportSymbol('WebGLEarth.prototype.setAltitude',
             weapi.exports.App.prototype.setAltitude);


/**
 * @return {number}
 */
weapi.exports.App.prototype.getAltitude = function() {
  return this.camera.getPos()[2];
};
exportSymbol('WebGLEarth.prototype.getAltitude',
             weapi.exports.App.prototype.getAltitude);


/**
 * @param {number} zoom
 */
weapi.exports.App.prototype.setZoom = function(zoom) {
  var alt = weapi.Camera.calcAltitudeForZoom(this.canvas,
                                             this.camera.camera.frustum.fovy,
                                             zoom, this.camera.getPos()[0]);
  this['setAltitude'](alt);
};
exportSymbol('WebGLEarth.prototype.setZoom',
             weapi.exports.App.prototype.setZoom);


/**
 * @return {number}
 */
weapi.exports.App.prototype.getZoom = function() {
  var pos = this.camera.getPos();
  var zoom = weapi.Camera.calcZoomForAltitude(this.canvas,
                                              this.camera.camera.frustum.fovy,
                                              pos[2], pos[0]);
  return zoom;
};
exportSymbol('WebGLEarth.prototype.getZoom',
             weapi.exports.App.prototype.getZoom);


/**
 * @param {number} lat
 * @param {number} lon
 * @param {number=} opt_zoom
 * @param {number=} opt_altitude
 * @param {number=} opt_heading
 * @param {number=} opt_tilt
 * @param {boolean=} opt_targetPosition
 */
weapi.exports.App.prototype.setPosition = function(lat, lon,
    opt_zoom, opt_altitude, opt_heading, opt_tilt, opt_targetPosition) {
  var cam = this.camera;
  cam.animator.cancel();

  lat = goog.math.toRadians(lat);
  lon = goog.math.toRadians(lon);

  if (goog.isDefAndNotNull(opt_zoom)) {
    //window['console']['log']('Zoom is no longer supported.');
    opt_altitude = weapi.Camera.calcAltitudeForZoom(this.canvas,
        cam.camera.frustum.fovy,
        opt_zoom, lat);
  }

  var alt = goog.isDef(opt_altitude) ? opt_altitude : cam.getPos()[2];
  var heading = goog.isDef(opt_heading) ?
                goog.math.toRadians(opt_heading) : cam.getHeading();
  var tilt = goog.isDef(opt_tilt) ?
             goog.math.toRadians(opt_tilt) : cam.getTilt();

  if (opt_targetPosition) {
    var newPos = weapi.Camera.calculatePositionForGivenTarget(
        lat, lon, alt,
        heading, tilt);

    lat = newPos[0];
    lon = newPos[1];
    if (goog.isDefAndNotNull(opt_zoom)) {
      // recalc altitude to better fit modified latitude
      //window['console']['log']('Zoom is no longer supported.');
      alt = weapi.Camera.calcAltitudeForZoom(this.canvas,
          cam.camera.frustum.fovy,
          opt_zoom, lat);
    }
  }

  cam.setPosHeadingAndTilt(lat, lon, alt, heading, tilt);
};
exportSymbol('WebGLEarth.prototype.setPosition',
             weapi.exports.App.prototype.setPosition);


/**
 * @return {!Array.<!number>}
 */
weapi.exports.App.prototype.getPosition = function() {
  var pos = this.camera.getPos();
  return [goog.math.toDegrees(pos[0]), goog.math.toDegrees(pos[1])];
};
exportSymbol('WebGLEarth.prototype.getPosition',
             weapi.exports.App.prototype.getPosition);


/**
 * @return {number}
 */
weapi.exports.App.prototype.getHeading = function() {
  return goog.math.toDegrees(this.camera.getHeading());
};
exportSymbol('WebGLEarth.prototype.getHeading',
             weapi.exports.App.prototype.getHeading);


/**
 * @return {number}
 */
weapi.exports.App.prototype.getTilt = function() {
  return goog.math.toDegrees(this.camera.getTilt());
};
exportSymbol('WebGLEarth.prototype.getTilt',
             weapi.exports.App.prototype.getTilt);


/**
 * @param {number} heading
 */
weapi.exports.App.prototype.setHeading = function(heading) {
  this.camera.animator.cancel();
  this.camera.setHeading(goog.math.toRadians(heading));
};
exportSymbol('WebGLEarth.prototype.setHeading',
             weapi.exports.App.prototype.setHeading);


/**
 * @param {number} tilt
 */
weapi.exports.App.prototype.setTilt = function(tilt) {
  this.camera.animator.cancel();
  this.camera.setTilt(goog.math.toRadians(tilt));
};
exportSymbol('WebGLEarth.prototype.setTilt',
             weapi.exports.App.prototype.setTilt);


/**
 * @param {number} latitude
 * @param {number} longitude
 * @param {number=} opt_altitude
 * @param {number=} opt_heading
 * @param {number=} opt_tilt
 * @param {boolean=} opt_targetPosition
 * @param {number=} opt_duration In seconds.
 */
weapi.exports.App.prototype.flyTo = function(latitude, longitude, opt_altitude,
                                             opt_heading, opt_tilt,
                                             opt_targetPosition, opt_duration) {
  this.camera.animator.flyTo(goog.math.toRadians(latitude),
      goog.math.toRadians(longitude),
      opt_altitude,
      goog.isDef(opt_heading) ? goog.math.toRadians(opt_heading) : undefined,
      goog.isDef(opt_tilt) ? goog.math.toRadians(opt_tilt) : undefined,
      opt_targetPosition, opt_duration);
};
exportSymbol('WebGLEarth.prototype.flyTo',
             weapi.exports.App.prototype.flyTo);


/**
 * @param {number} minlat
 * @param {number} maxlat
 * @param {number} minlon
 * @param {number} maxlon
 * @param {number=} opt_heading
 * @param {number=} opt_tilt
 * @param {number=} opt_duration In seconds.
 */
weapi.exports.App.prototype.flyToFitBounds = function(minlat, maxlat,
                                                      minlon, maxlon,
                                                      opt_heading, opt_tilt,
                                                      opt_duration) {
  minlat = goog.math.toRadians(minlat);
  maxlat = goog.math.toRadians(maxlat);
  minlon = goog.math.toRadians(minlon);
  maxlon = goog.math.toRadians(maxlon);

  var altitude = this.camera.calcDistanceToViewBounds(minlat, maxlat,
      minlon, maxlon);

  minlon = goog.math.modulo(minlon, 2 * Math.PI);
  maxlon = goog.math.modulo(maxlon, 2 * Math.PI);

  var lonDiff = minlon - maxlon;
  if (lonDiff < -Math.PI) {
    minlon += 2 * Math.PI;
  } else if (lonDiff > Math.PI) {
    maxlon += 2 * Math.PI;
  }

  var center = [(minlat + maxlat) / 2, (minlon + maxlon) / 2];

  this.camera.animator.flyTo(center[0], center[1], altitude,
      goog.isDef(opt_heading) ? goog.math.toRadians(opt_heading) : undefined,
      goog.isDef(opt_tilt) ? goog.math.toRadians(opt_tilt) : undefined,
      goog.isDef(opt_heading) || goog.isDef(opt_tilt), opt_duration);
};
exportSymbol('WebGLEarth.prototype.flyToFitBounds',
             weapi.exports.App.prototype.flyToFitBounds);


/**
 * @return {Array.<!number>|undefined}
 */
weapi.exports.App.prototype.getTarget = function() {
  var center = new Cesium.Cartesian2(this.canvas.width / 2,
                                     this.canvas.height / 2);
  var position = this.camera.camera.pickEllipsoid(center);

  if (goog.isDefAndNotNull(position)) {
    var carto = this.camera.ellipsoid.cartesianToCartographic(position);
    return [goog.math.toDegrees(carto.latitude),
            goog.math.toDegrees(carto.longitude)];
  } else {
    return undefined;
  }
};
exportSymbol('WebGLEarth.prototype.getTarget',
             weapi.exports.App.prototype.getTarget);


/**
 * Calculates (very roughly) the visible extent.
 * @param {number=} opt_scale Factor to use to scale the result.
 * @param {number=} opt_prec Precision factor (default 4).
 * @return {?Array.<number>} [minlat, maxlat, minlon, maxlon] or null.
 */
weapi.exports.App.prototype.getBounds = function(opt_scale, opt_prec) {
  opt_prec = opt_prec || 4;
  var result = [90, -90, 180, -180], valid = 0;

  var stepX = this.canvas.width / (opt_prec - 1),
      stepY = this.canvas.height / (opt_prec - 1);
  for (var x = 0; x < opt_prec; x++) {
    for (var y = 0; y < opt_prec; y++) {
      var center = new Cesium.Cartesian2(x * stepX, y * stepY);
      var position = this.camera.camera.pickEllipsoid(center);

      if (goog.isDefAndNotNull(position)) {
        var carto = this.camera.ellipsoid.cartesianToCartographic(position);
        result[0] = Math.min(result[0], carto.latitude);
        result[1] = Math.max(result[1], carto.latitude);
        result[2] = Math.min(result[2], carto.longitude);
        result[3] = Math.max(result[3], carto.longitude);
        valid++;
      }
    }
  }

  if (valid > 2) {
    if (goog.isDefAndNotNull(opt_scale)) {
      var deltaY = ((result[1] - result[0]) / 2) * (opt_scale - 1);
      var deltaX = ((result[3] - result[2]) / 2) * (opt_scale - 1);
      result[0] -= deltaY;
      result[1] += deltaY;
      result[2] -= deltaX;
      result[3] += deltaX;
    }
    return [goog.math.toDegrees(result[0]), goog.math.toDegrees(result[1]),
            goog.math.toDegrees(result[2]), goog.math.toDegrees(result[3])];
  } else {
    return null;
  }
};
exportSymbol('WebGLEarth.prototype.getBounds',
             weapi.exports.App.prototype.getBounds);


////////////////////////////////////////////////////////////////////////////////
/* Interaction limits */


/**
 * @param {number} alt
 */
weapi.exports.App.prototype.setMinAltitude = function(alt) {
  var sscc = this.scene.screenSpaceCameraController;
  sscc.minimumZoomDistance = alt || 0;
};
exportSymbol('WebGLEarth.prototype.setMinAltitude',
             weapi.exports.App.prototype.setMinAltitude);


/**
 * @param {number} alt
 */
weapi.exports.App.prototype.setMaxAltitude = function(alt) {
  var sscc = this.scene.screenSpaceCameraController;
  sscc.maximumZoomDistance = alt || Infinity;
};
exportSymbol('WebGLEarth.prototype.setMaxAltitude',
             weapi.exports.App.prototype.setMaxAltitude);


////////////////////////////////////////////////////////////////////////////////
/* Various */


/**
 * @return {!Cesium.Scene}
 */
weapi.exports.App.prototype.getCesiumScene = function() {
  return this.scene;
};
exportSymbol('WebGLEarth.prototype.getCesiumScene',
             weapi.exports.App.prototype.getCesiumScene);


exportSymbol('WebGLEarth.prototype.handleResize',
             weapi.exports.App.prototype.handleResize);


/**
 * @param {string} name
 */
weapi.exports.App.prototype.saveScreenshot = function(name) {
  this.afterFrameOnce = goog.bind(function() {
    var canvas_ = we.canvas2image.prepareCanvas(this.scene.canvas,
                                                this.markerManager,
                                                this.miniglobe);
    we.canvas2image.saveCanvasAsPNG(canvas_, name);
  }, this);
  this.sceneChanged = true;
};
exportSymbol('WebGLEarth.prototype.saveScreenshot',
             weapi.exports.App.prototype.saveScreenshot);


/**
 * @param {!function(string)} callback
 */
weapi.exports.App.prototype.getScreenshot = function(callback) {
  this.afterFrameOnce = goog.bind(function() {
    var canvas_ = we.canvas2image.prepareCanvas(this.scene.canvas,
                                                this.markerManager,
                                                this.miniglobe);
    callback(we.canvas2image.getCanvasAsDataURL(canvas_));
  }, this);
  this.sceneChanged = true;
};
exportSymbol('WebGLEarth.prototype.getScreenshot',
             weapi.exports.App.prototype.getScreenshot);


/**
 * @param {string} src
 * @param {number} size
 */
weapi.exports.App.prototype.showMiniGlobe = function(src, size) {
  if (goog.isDefAndNotNull(src)) {
    this.miniglobe = new weapi.MiniGlobe(this, 32, 32, src);
    this.miniglobe.setSize(size);
  } else {
    this.miniglobe = null;
  }

  this.sceneChanged = true;
};
exportSymbol('WebGLEarth.prototype.showMiniGlobe',
             weapi.exports.App.prototype.showMiniGlobe);


/** */
weapi.exports.App.prototype.pauseRendering = function() {
  this.forcedPause = true;
};
exportSymbol('WebGLEarth.prototype.pauseRendering',
             weapi.exports.App.prototype.pauseRendering);


/** */
weapi.exports.App.prototype.resumeRendering = function() {
  this.forcedPause = false;
};
exportSymbol('WebGLEarth.prototype.resumeRendering',
             weapi.exports.App.prototype.resumeRendering);


/**
 * @param {number} lat
 * @param {number} lng
 * @return {Array.<number>|null}
 */
weapi.exports.App.prototype.getBestAvailablePixelColor = function(lat, lng) {
  return this.getBestAvailablePixelColorFromLayer(
      lat / 180 * Math.PI, lng / 180 * Math.PI);
};
exportSymbol('WebGLEarth.prototype.getBestAvailablePixelColor',
             weapi.exports.App.prototype.getBestAvailablePixelColor);


////////////////////////////////////////////////////////////////////////////////
/* Maps */


/** @enum {string} */
weapi.exports.Maps = weapi.maps.MapType;
exportSymbol('WebGLEarth.Maps', weapi.exports.Maps);


/**
 * @param {!weapi.maps.MapType} type
 * @param {!Object.<string, Object>|!Array.<Object>=} opt_opts
 * @return {weapi.Map}
 */
weapi.exports.App.prototype.initMap = function(type, opt_opts) {
  return weapi.maps.initMap(this, type, opt_opts);
};
exportSymbol('WebGLEarth.prototype.initMap',
             weapi.exports.App.prototype.initMap);
exportSymbol('WebGLEarth.prototype.setBaseMap',
             weapi.exports.App.prototype.setBaseMap);
exportSymbol('WebGLEarth.prototype.setOverlayMap',
             weapi.exports.App.prototype.setOverlayMap);



/** @constructor */
weapi.exports.Map = weapi.Map;
exportSymbol('WebGLEarth.Map', weapi.exports.Map);
exportSymbol('WebGLEarth.Map.prototype.setBoundingBox',
             weapi.exports.Map.prototype.setBoundingBox);
exportSymbol('WebGLEarth.Map.prototype.setOpacity',
             weapi.exports.Map.prototype.setOpacity);
exportSymbol('WebGLEarth.Map.prototype.getOpacity',
             weapi.exports.Map.prototype.getOpacity);


////////////////////////////////////////////////////////////////////////////////
/* Markers */



/** @constructor */
weapi.exports.Marker = weapi.markers.PrettyMarker;
exportSymbol('WebGLEarth.Marker', weapi.exports.Marker);


/**
 * @param {number} lat
 * @param {number} lon
 */
weapi.exports.Marker.prototype.setPosition = function(lat, lon) {
  this.lat = goog.math.toRadians(lat);
  this.lon = goog.math.toRadians(lon);
};
exportSymbol('WebGLEarth.Marker.prototype.setPosition',
             weapi.exports.Marker.prototype.setPosition);


/**
 * @param {string} content
 * @param {number} maxWidth
 * @param {boolean} closeBtn
 * @return {!weapi.exports.Marker}
 */
weapi.exports.Marker.prototype.bindPopup = function(content, maxWidth,
                                                    closeBtn) {
  this.attachPopup(new weapi.markers.Popup(content, maxWidth, closeBtn));
  return this;
};
exportSymbol('WebGLEarth.Marker.prototype.bindPopup',
             weapi.exports.Marker.prototype.bindPopup);


/** */
weapi.exports.Marker.prototype.openPopup = function() {
  this.showPopup(true);
};
exportSymbol('WebGLEarth.Marker.prototype.openPopup',
             weapi.exports.Marker.prototype.openPopup);


/** */
weapi.exports.Marker.prototype.closePopup = function() {
  this.showPopup(false);
};
exportSymbol('WebGLEarth.Marker.prototype.closePopup',
             weapi.exports.Marker.prototype.closePopup);

exportSymbol('WebGLEarth.prototype.initMarker',
             weapi.exports.App.prototype.initMarker);
exportSymbol('WebGLEarth.prototype.removeMarker',
             weapi.exports.App.prototype.removeMarker);


/**
 * @param {string} type
 * @param {!function(Event)} listener
 * @return {number}
 */
weapi.exports.Marker.prototype.on = function(type, listener) {
  /**
   * Wraps the listener function with a wrapper function
   * that adds some extended event info.
   * @param {!weapi.markers.AbstractMarker} marker .
   * @param {function(Event)} listener Original listener function.
   * @return {!function(Event)} Wrapper listener.
   */
  var wrap = function(marker, listener) {
    return function(e) {
      e.target = marker;
      e['latitude'] = goog.math.toDegrees(marker.lat);
      e['longitude'] = goog.math.toDegrees(marker.lon);
      e['originalEvent'] = e.getBrowserEvent();

      listener(e);
    };
  };
  var key = goog.events.listen(this.element, type, wrap(this, listener));
  listener[goog.getUid(this) + '___eventKey_' + type] = key;

  return /** @type {number} */(key);
};
exportSymbol('WebGLEarth.Marker.prototype.on',
             weapi.exports.Marker.prototype.on);


/**
 */
weapi.exports.Marker.prototype.off = weapi.App.prototype.off;
exportSymbol('WebGLEarth.Marker.prototype.off',
             weapi.exports.Marker.prototype.off);


/**
 * @param {string} type
 */
weapi.exports.Marker.prototype.offAll = function(type) {
  goog.events.removeAll(this.element, type);
};
exportSymbol('WebGLEarth.Marker.prototype.offAll',
             weapi.exports.Marker.prototype.offAll);


////////////////////////////////////////////////////////////////////////////////
/* Custom marker */



/** @constructor */
weapi.exports.CustomMarker = weapi.markers.AbstractMarker;
exportSymbol('WebGLEarth.CustomMarker', weapi.exports.CustomMarker);

exportSymbol('WebGLEarth.CustomMarker.prototype.setPosition',
             weapi.exports.Marker.prototype.setPosition);

exportSymbol('WebGLEarth.CustomMarker.prototype.on',
             weapi.exports.Marker.prototype.on);

exportSymbol('WebGLEarth.CustomMarker.prototype.off',
             weapi.exports.Marker.prototype.off);

exportSymbol('WebGLEarth.CustomMarker.prototype.offAll',
             weapi.exports.Marker.prototype.offAll);

////////////////////////////////////////////////////////////////////////////////
/* Events */

exportSymbol('WebGLEarth.prototype.on', weapi.exports.App.prototype.on);
exportSymbol('WebGLEarth.prototype.off', weapi.exports.App.prototype.off);
exportSymbol('WebGLEarth.prototype.offAll', weapi.exports.App.prototype.offAll);

////////////////////////////////////////////////////////////////////////////////
/* Polygons */



/**
 * @param {!weapi.App} app .
 * @constructor
 * @extends {weapi.EditablePolygon}
 */
weapi.exports.Polygon = function(app) {
  goog.base(this, app, app.markerManager);
};
goog.inherits(weapi.exports.Polygon, weapi.EditablePolygon);

exportSymbol('WebGLEarth.Polygon', weapi.exports.Polygon);

exportSymbol('WebGLEarth.Polygon.prototype.destroy',
             weapi.exports.Polygon.prototype.destroy);

exportSymbol('WebGLEarth.Polygon.prototype.enableClickToAdd',
             weapi.exports.Polygon.prototype.enableClickToAdd);
exportSymbol('WebGLEarth.Polygon.prototype.disableClickToAdd',
             weapi.exports.Polygon.prototype.disableClickToAdd);

exportSymbol('WebGLEarth.Polygon.prototype.setFillColor',
             weapi.exports.Polygon.prototype.setFillColor);
exportSymbol('WebGLEarth.Polygon.prototype.setStrokeColor',
             weapi.exports.Polygon.prototype.setStrokeColor);

exportSymbol('WebGLEarth.Polygon.prototype.setOnChange',
             weapi.exports.Polygon.prototype.setOnChange);
exportSymbol('WebGLEarth.Polygon.prototype.isValid',
             weapi.exports.Polygon.prototype.isValid);
exportSymbol('WebGLEarth.Polygon.prototype.getRoughArea',
             weapi.exports.Polygon.prototype.getRoughArea);
exportSymbol('WebGLEarth.Polygon.prototype.intersects',
             weapi.exports.Polygon.prototype.intersects);

exportSymbol('WebGLEarth.Polygon.prototype.setIcon',
             weapi.exports.Polygon.prototype.setIcon);
exportSymbol('WebGLEarth.Polygon.prototype.showDraggers',
             weapi.exports.Polygon.prototype.showDraggers);

exportSymbol('WebGLEarth.Polygon.prototype.addPoint',
             weapi.exports.Polygon.prototype.addPoint);
exportSymbol('WebGLEarth.Polygon.prototype.addPoints',
             weapi.exports.Polygon.prototype.addPoints);
exportSymbol('WebGLEarth.Polygon.prototype.movePoint',
             weapi.exports.Polygon.prototype.movePoint);
exportSymbol('WebGLEarth.Polygon.prototype.removePoint',
             weapi.exports.Polygon.prototype.removePoint);

exportSymbol('WebGLEarth.Polygon.prototype.getPoints',
             weapi.exports.Polygon.prototype.getPoints);
exportSymbol('WebGLEarth.Polygon.prototype.getCentroid',
             weapi.exports.Polygon.prototype.getCentroid);


/**
 * @param {!function(!weapi.exports.Polygon)} callback
 * @suppress {accessControls}
 */
weapi.exports.Polygon.prototype.onClick = function(callback) {
  goog.events.listen(this.app.canvas, goog.events.EventType.CLICK, function(e) {
    var cartesian = this.app.camera.camera.pickEllipsoid(
        new Cesium.Cartesian2(e.offsetX, e.offsetY));
    if (goog.isDefAndNotNull(cartesian)) {
      var carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
      if (this.isPointIn(goog.math.toDegrees(carto.latitude),
                         goog.math.toDegrees(carto.longitude)) ||
          this.icon_.isPointIn(e.offsetX, e.offsetY)) {
        callback(this);
      }
    }
  }, false, this);
};
exportSymbol('WebGLEarth.Polygon.prototype.onClick',
             weapi.exports.Polygon.prototype.onClick);


////////////////////////////////////////////////////////////////////////////////
/* DEPRECATED */
exportSymbol('WebGLEarth.prototype.setCenter', function(coords) {
  var cam = this.camera;
  cam.animator.cancel();

  cam.setPosHeadingAndTilt(goog.math.toRadians(coords[0]),
                           goog.math.toRadians(coords[1]),
                           cam.getPos()[2], cam.getHeading(), 0);
});

exportSymbol('WebGLEarth.prototype.getCenter', function() {
  var pos = this.camera.getPos();
  return [goog.math.toDegrees(pos[0]), goog.math.toDegrees(pos[1])];
});
