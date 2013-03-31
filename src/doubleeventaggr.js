/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.DoubleEventAggr');



/**
 * @param {!Cesium.CameraEventAggregator} a .
 * @param {!Cesium.CameraEventAggregator} b .
 * @param {boolean=} opt_invA .
 * @param {boolean=} opt_invB .
 * @constructor
 */
weapi.DoubleEventAggr = function(a, b, opt_invA, opt_invB) {
  this.a_ = a;
  this.b_ = b;
  this.invA_ = opt_invA || false;
  this.invB_ = opt_invB || false;
};


/**
 * @return {boolean} .
 * @this {weapi.DoubleEventAggr}
 */
weapi.DoubleEventAggr.prototype['isMoving'] = function() {
  return this.a_.isMoving() || this.b_.isMoving();
};


/**
 * @return {Object} .
 * @this {weapi.DoubleEventAggr}
 */
weapi.DoubleEventAggr.prototype['getMovement'] = function() {
  // get both movements to flush the update queues
  var a = this.a_.getMovement();
  var b = this.b_.getMovement();

  var chooseA = (this.a_.isButtonDown() && goog.isDefAndNotNull(a)) ||
                (!this.a_.isButtonDown() && !goog.isDefAndNotNull(b));

  var chosen = chooseA ? a : b;

  // invert the tilting direction
  //if ((chooseA && this.invA_) ||
  //    (!chooseA && this.invB_)) {
  //var tmp = chosen['startPosition']['y'];
  //chosen['startPosition']['y'] *= -1;// = -chosen['endPosition']['y'];
  //chosen['endPosition']['y'] *= -1;//= -tmp;
  //chosen['motion']['x'] *= -1;
  //chosen['motion']['y'] *= -1;
  //}

  return chosen;
};


/**
 * @return {Object} .
 * @this {weapi.DoubleEventAggr}
 */
weapi.DoubleEventAggr.prototype['getLastMovement'] = function() {
  return null; // should not be needed for our needs
};


/**
 * @return {boolean} .
 * @this {weapi.DoubleEventAggr}
 */
weapi.DoubleEventAggr.prototype['isButtonDown'] = function() {
  return this.a_.isButtonDown() || this.b_.isButtonDown();
};


/**
 * @return {number} .
 * @this {weapi.DoubleEventAggr}
 */
weapi.DoubleEventAggr.prototype['getButtonPressTime'] = function() {
  var a = this.a_.getButtonPressTime();
  var b = this.b_.getButtonPressTime();
  return a < b ? a : b;
};


/**
 * @return {number} .
 * @this {weapi.DoubleEventAggr}
 */
weapi.DoubleEventAggr.prototype['getButtonReleaseTime'] = function() {
  var a = this.a_.getButtonReleaseTime();
  var b = this.b_.getButtonReleaseTime();
  return a > b ? a : b;
};


/**
 * @return {boolean} .
 * @this {weapi.DoubleEventAggr}
 */
weapi.DoubleEventAggr.prototype['isDestroyed'] = function() {
  return false;
};


/**
 * @this {weapi.DoubleEventAggr}
 */
weapi.DoubleEventAggr.prototype['destroy'] = function() {
  this.a_.destroy();
  this.b_.destroy();
};
