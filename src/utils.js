/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.utils');


/**
 * @const {number} Simplified Earth radius
 */
weapi.utils.EARTH_RADIUS = 6378137;


/**
 * TODO: fix for other ellipsoids
 * Calculates distance of two points on the surface.
 * @param {number} lat1 .
 * @param {number} lon1 .
 * @param {number} lat2 .
 * @param {number} lon2 .
 * @return {number} Calculated distance.
 */
weapi.utils.calculateDistance = function(lat1, lon1, lat2, lon2) {
  var sindlathalf = Math.sin((lat2 - lat1) / 2);
  var sindlonhalf = Math.sin((lon2 - lon1) / 2);
  var a = sindlathalf * sindlathalf +
          Math.cos(lat1) * Math.cos(lat2) * sindlonhalf * sindlonhalf;
  var angle = 2 * Math.asin(Math.sqrt(a));
  return weapi.utils.EARTH_RADIUS * angle;
};


/**
 * @param {!weapi.App} app .
 * @param {number} lat Latitude in radians.
 * @param {number} lng Longitude in radians.
 * @param {number=} opt_alt Altitude in meters.
 * @return {Array.<number>} Array [x, y, visibility] or null.
 */
weapi.utils.getXYForLatLng = function(app, lat, lng, opt_alt) {
  var cam = app.camera.camera;
  var pos = new Cesium.Cartographic(lng, lat, opt_alt || 0);
  var cartes3 = Cesium.Ellipsoid.WGS84.cartographicToCartesian(pos);
  var cartes4 = new Cesium.Cartesian4(cartes3.x, cartes3.y, cartes3.z, 1);

  var mvp = app.scene.context.uniformState.modelViewProjection;

  var proj = Cesium.Matrix4.multiplyByVector(mvp, cartes4,
                                             new Cesium.Cartesian4());

  if (!goog.isDefAndNotNull(proj)) return null;

  var w = 1 / proj.w;
  var x = (proj.x * w + 1) / 2;
  var y = 1 - ((proj.y * w) + 1) / 2;

  var visibility = 1;
  if (x < -0.1 || x > 1.1 ||
      y < -0.1 || y > 1.1) {
    visibility = 0;
  } else {
    var direction = Cesium.Cartesian3.subtract(cartes3, cam.position, cartes3);
    var distance = Cesium.Cartesian3.magnitude(direction);

    var ldotc = -Cesium.Cartesian3.dot(
        Cesium.Cartesian3.normalize(direction, new Cesium.Cartesian3()),
        cam.position);
    var cdotc = Cesium.Cartesian3.dot(cam.position, cam.position);

    var r = weapi.utils.EARTH_RADIUS;
    var val = ldotc * ldotc - cdotc + r * r;

    var d1, d2;
    if (val < 0) {
      return null;
    } else {
      d1 = Math.min(ldotc + Math.sqrt(val), ldotc - Math.sqrt(val));
      d2 = Math.max(ldotc + Math.sqrt(val), ldotc - Math.sqrt(val));
    }

    visibility = (Math.abs(distance - d1) < Math.abs(distance - d2)) ? 1 : 0;
  }

  return [x * app.canvas.width, y * app.canvas.height, visibility];
};


/**
 * TODO: Use goog.style.installStyles after updating the closure-library.
 * @param {string} stylesString The style string to install.
 * @param {Node=} opt_node Node whose parent document should have the
 *     styles installed.
 * @return {Element|StyleSheet} The style element created.
 */
weapi.utils.installStyles = function(stylesString, opt_node) {
  var dh = goog.dom.getDomHelper(opt_node);
  var styleSheet = null;

  // IE < 11 requires createStyleSheet. Note that doc.createStyleSheet will be
  // undefined as of IE 11.
  var doc = dh.getDocument();
  if (goog.userAgent.IE && doc.createStyleSheet) {
    styleSheet = doc.createStyleSheet();
    goog.style.setStyles(styleSheet, stylesString);
  } else {
    var head = dh.getElementsByTagNameAndClass('head')[0];

    // In opera documents are not guaranteed to have a head element, thus we
    // have to make sure one exists before using it.
    if (!head) {
      var body = dh.getElementsByTagNameAndClass('body')[0];
      head = dh.createDom('head');
      body.parentNode.insertBefore(head, body);
    }
    styleSheet = dh.createDom('style');
    // NOTE(user): Setting styles after the style element has been appended
    // to the head results in a nasty Webkit bug in certain scenarios. Please
    // refer to https://bugs.webkit.org/show_bug.cgi?id=26307 for additional
    // details.
    goog.style.setStyles(styleSheet, stylesString);
    dh.appendChild(head, styleSheet);
  }
  return styleSheet;
};
