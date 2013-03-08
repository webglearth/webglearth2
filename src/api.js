/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi');

goog.require('goog.math');

goog.require('we.canvas2image');
goog.require('weapi.App');
goog.require('weapi.Map');


//Constructor
goog.exportSymbol('WebGLEarth', weapi.App);

goog.exportSymbol('WebGLEarth.prototype.handleResize',
                  weapi.App.prototype.handleResize);


goog.exportSymbol('WebGLEarth.prototype.setAltitude', function(alt) {
  this.camera.setPos(undefined, undefined, alt);
});

goog.exportSymbol('WebGLEarth.prototype.getAltitude', function() {
  return this.camera.getPos()[2];
});

goog.exportSymbol('WebGLEarth.prototype.setPosition', function(lat, lng) {
  this.camera.setPos(goog.math.toRadians(lat),
                     goog.math.toRadians(lng),
                     undefined);
});

goog.exportSymbol('WebGLEarth.prototype.getPosition', function() {
  var pos = this.camera.getPos();
  return [goog.math.toDegrees(pos[0]), goog.math.toDegrees(pos[1])];
});


goog.exportSymbol('WebGLEarth.prototype.getHeading', function() {
  return goog.math.toDegrees(this.camera.getHeading());
});


goog.exportSymbol('WebGLEarth.prototype.getTilt', function() {
  return goog.math.toDegrees(this.camera.getTilt());
});


goog.exportSymbol('WebGLEarth.prototype.setHeading', function(heading) {
  this.camera.setHeading(goog.math.toRadians(heading));
});


goog.exportSymbol('WebGLEarth.prototype.setTilt', function(tilt) {
  this.camera.setTilt(goog.math.toRadians(tilt));
});


goog.exportSymbol('WebGLEarth.prototype.flyTo', function(latitude, longitude,
                                                         opt_altitude,
                                                         opt_heading,
                                                         opt_tilt,
                                                         opt_targetPosition) {
      this.camera.animator.flyTo(goog.math.toRadians(latitude),
          goog.math.toRadians(longitude),
          opt_altitude,
          goog.math.toRadians(opt_heading),
          goog.math.toRadians(opt_tilt),
          opt_targetPosition);
    });


goog.exportSymbol('WebGLEarth.prototype.flyToFitBounds', function(minlat,
                                                                  maxlat,
                                                                  minlon,
                                                                  maxlon) {
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

      this.camera.animator.flyTo(center[0], center[1], altitude);
    });


goog.exportSymbol('WebGLEarth.prototype.saveScreenshot', function(name) {
  this.afterFrameOnce = goog.bind(function() {
    //var canvas_ = we.canvas2image.prepareCanvas(this.context.canvas,
    //                                            this.markerManager,
    //                                            this.context.scene.miniGlobe);
    we.canvas2image.saveCanvasAsPNG(this.scene.getCanvas(), name);
  }, this);
});

goog.exportSymbol('WebGLEarth.prototype.getScreenshot', function(callback) {
  this.afterFrameOnce = goog.bind(function() {
    //var canvas_ = we.canvas2image.prepareCanvas(this.context.canvas,
    //                                            this.markerManager,
    //                                            this.context.scene.miniGlobe);
    callback(we.canvas2image.getCanvasAsDataURL(this.scene.getCanvas()));
  }, this);
});


////////////////////////////////////////////////////////////////////////////////

goog.exportSymbol('WebGLEarth.Maps', weapi.maps.MapType);
goog.exportSymbol('WebGLEarth.prototype.initMap', weapi.maps.initMap);
goog.exportSymbol('WebGLEarth.prototype.setBaseMap',
                  weapi.App.prototype.setBaseMap);
goog.exportSymbol('WebGLEarth.prototype.setOverlayMap',
                  weapi.App.prototype.setOverlayMap);

goog.exportSymbol('WebGLEarth.Map', weapi.Map);
goog.exportSymbol('WebGLEarth.Map.prototype.setBoundingBox',
                  weapi.Map.prototype.setBoundingBox);
goog.exportSymbol('WebGLEarth.Map.prototype.setOpacity',
                  weapi.Map.prototype.setOpacity);
goog.exportSymbol('WebGLEarth.Map.prototype.getOpacity',
                  weapi.Map.prototype.getOpacity);
