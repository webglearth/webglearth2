/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.CameraAnimator');

goog.require('goog.events');
goog.require('goog.fx.Animation');
goog.require('goog.fx.Animation.EventType');
goog.require('goog.fx.AnimationSerialQueue');
goog.require('goog.fx.Transition.EventType');
goog.require('goog.math');

goog.require('weapi.utils');



/**
 * @param {!weapi.Camera} camera Camera to be animated by this object.
 * @constructor
 */
weapi.CameraAnimator = function(camera) {

  /**
   * @type {!weapi.Camera}
   * @private
   */
  this.camera_ = camera;

  /**
   * @type {goog.fx.AnimationSerialQueue}
   * @private
   */
  this.animation_ = null;
};


/**
 * @define {number} Animation duration in seconds.
 */
weapi.CameraAnimator.CAMERA_ANIMATION_DURATION = 3;


/**
 * @define {number} How much can the camera climb (or descent)
 *                  (in meters of altitude per meters of surface distance).
 */
weapi.CameraAnimator.CAMERA_ANIMATION_MAX_ASCENT = 0.2;


/**
 * TODO: use CameraFlightPath ?
 * Initiate and start the animation to given location.
 * @param {number} latitude Latitude in radians.
 * @param {number} longitude Longitude in radians.
 * @param {number=} opt_altitude Altitude (otherwise unchanged).
 * @param {number=} opt_heading Heading (otherwise 0).
 * @param {number=} opt_tilt Tilt (otherwise 0).
 * @param {boolean=} opt_targetPosition If true, the camera is position in
 *                                      such a way, that the camera target is
 *                                      [latitude, longitude] (default false).
 * @param {number=} opt_duration Duration of the animation in seconds.
 */
weapi.CameraAnimator.prototype.flyTo = function(latitude, longitude,
                                                opt_altitude,
                                                opt_heading, opt_tilt,
                                                opt_targetPosition,
                                                opt_duration) {
  var cam = this.camera_;

  if (opt_targetPosition) {
    var newPos = weapi.Camera.calculatePositionForGivenTarget(
        latitude, longitude, opt_altitude || cam.getPos()[2],
        opt_heading, opt_tilt);

    latitude = newPos[0];
    longitude = newPos[1];
  }

  if (goog.isDefAndNotNull(this.animation_)) {
    this.onEnd_();
  }

  var srcPos = cam.getPos();
  var curAlt = srcPos[2];
  var dstAlt = opt_altitude || curAlt;

  // Validates start and end location so that
  // the animation goes through the shortest path.
  var lonStart = goog.math.modulo(srcPos[1], 2 * Math.PI);
  var lonEnd = goog.math.modulo(longitude, 2 * Math.PI);

  var lonDiff = lonStart - lonEnd;
  if (lonDiff < -Math.PI) {
    lonStart += 2 * Math.PI;
  } else if (lonDiff > Math.PI) {
    lonEnd += 2 * Math.PI;
  }


  var start_ = [srcPos[0], lonStart, curAlt, cam.getHeading(), cam.getTilt()];
  var end_ = [latitude, lonEnd, dstAlt, opt_heading || 0, opt_tilt || 0];

  //in-out quintic
  var supereasing = function(t) {
    var t2 = t * t;
    var t3 = t * t * t;
    return 6 * t3 * t2 + -15 * t2 * t2 + 10 * t3;
  };
  var supereasing_f = function(t) {return 2 * supereasing(t / 2);};
  var halfVal = supereasing(0.5);
  var supereasing_l = function(t) {
    return (supereasing(0.5 + t / 2) - halfVal) / (1 - halfVal);
  };

  var animationAlteringEvents = [goog.fx.Transition.EventType.BEGIN,
                                 goog.fx.Animation.EventType.ANIMATE,
                                 goog.fx.Transition.EventType.END,
                                 goog.fx.Transition.EventType.FINISH];

  this.animation_ = new goog.fx.AnimationSerialQueue();

  var duration =
      1000 * (opt_duration || weapi.CameraAnimator.CAMERA_ANIMATION_DURATION);

  if (opt_altitude) {
    var distance = weapi.utils.calculateDistance(srcPos[0], srcPos[1],
                                                 latitude, longitude);

    var topPoint = Math.min(curAlt, dstAlt) +
                   distance * weapi.CameraAnimator.CAMERA_ANIMATION_MAX_ASCENT;

    //Don't allow the topPoint to be lower than highest of the two points
    if (topPoint < Math.max(curAlt, dstAlt)) {
      topPoint = (curAlt + dstAlt) / 2;
    }

    var top = [];
    top[0] = (start_[0] + end_[0]) / 2;
    top[1] = (start_[1] + end_[1]) / 2;
    top[2] = topPoint;
    top[3] = (start_[3] + end_[3]) / 2;
    top[4] = (start_[4] + end_[4]) / 2;

    var ascentAnim = new goog.fx.Animation(start_, top,
                                           duration / 2, supereasing_f);

    var descentAnim = new goog.fx.Animation(top, end_,
                                            duration / 2, supereasing_l);

    goog.events.listen(ascentAnim, animationAlteringEvents,
                       this.onEverythingAnimate_, false, this);

    goog.events.listen(descentAnim, animationAlteringEvents,
                       this.onEverythingAnimate_, false, this);

    this.animation_.add(ascentAnim);
    this.animation_.add(descentAnim);
  } else {
    //single animation when altitude is not changing
    var anim = new goog.fx.Animation(start_, end_, duration, supereasing);

    goog.events.listen(anim, animationAlteringEvents,
                       this.onEverythingAnimate_, false, this);

    this.animation_.add(anim);
  }


  goog.events.listen(this.animation_, goog.fx.Transition.EventType.END,
                     this.onEnd_, false, this);

  this.animation_.play();
};


/**
 * Animate everything except altitude
 * @param {goog.events.Event} e The event.
 * @private
 */
weapi.CameraAnimator.prototype.onEverythingAnimate_ = function(e) {
  this.camera_.setPosHeadingAndTilt(e.coords[0], e.coords[1], e.coords[2],
                                    e.coords[3], e.coords[4]);
};


/**
 * Called when animation ends
 * @private
 */
weapi.CameraAnimator.prototype.onEnd_ = function() {
  if (goog.isDefAndNotNull(this.animation_)) {
    this.animation_.dispose();
    this.animation_ = null;
  }
};


/**
 * If the animation is in progress, cancel it
 */
weapi.CameraAnimator.prototype.cancel = function() {
  this.onEnd_();
};
