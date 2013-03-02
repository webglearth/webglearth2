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


//Constructor
goog.exportSymbol('WebGLEarth', weapi.App);

goog.exportSymbol('WebGLEarth.prototype.handleResize',
                  weapi.App.prototype.handleResize);


goog.exportSymbol('WebGLEarth.prototype.setAltitude', function(alt) {
  this.setCameraPos(undefined, undefined, alt);
});

goog.exportSymbol('WebGLEarth.prototype.getAltitude', function() {
  return this.getCameraPos()[2];
});

goog.exportSymbol('WebGLEarth.prototype.setPosition', function(lat, lng) {
  this.setCameraPos(goog.math.toRadians(lat),
      goog.math.toRadians(lng),
      undefined);
});

goog.exportSymbol('WebGLEarth.prototype.getPosition', function() {
  var pos = this.getCameraPos();
  return [goog.math.toDegrees(pos[0]), goog.math.toDegrees(pos[1])];
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

