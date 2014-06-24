/**
 *
 * @fileoverview Object representing single polygon + useful operations.
 *               The polygon can even be concave, the class calculates
 *               a triangulation of the polygon to be able to render it.
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.Polygon');



/**
 * @constructor
 */
weapi.Polygon = function() {
  /**
   * @type {!Cesium.Polygon}
   */
  this.primitive = new Cesium.Polygon({'asynchronous': false});

  /**
   * @type {!Cesium.PolylineCollection}
   */
  this.primitiveLineCol = new Cesium.PolylineCollection();

  /**
   * @type {!Cesium.Polyline}
   */
  this.primitiveLine = this.primitiveLineCol.add();

  /**
   * @type {?weapi.Polygon.Node}
   * @private
   */
  this.head_ = null;

  /**
   * @type {!Array.<!weapi.Polygon.Node>}
   * @private
   */
  this.vertices_ = [];

  /**
   * @type {number}
   * @private
   */
  this.numVertices_ = 0;

  this.primitive.material.uniforms['color'] = new Cesium.Color(1, 0, 0, .8);

  this.primitiveLine.material.uniforms['color'] =
      new Cesium.Color(0, 0, 0, 1);
  this.primitiveLine.width = 2;

  /**
   * @type {number}
   * @private
   */
  this.roughArea_ = 0;

  /**
   * @type {boolean}
   * @private
   */
  this.valid_ = false;

  /**
   * @type {boolean}
   * @private
   */
  this.pointSwitchFlag_ = false;

  /**
   * @type {!Array.<!Array.<!weapi.Polygon.Node>>}
   * @private
   */
  this.triangulation_ = [];
};


/**
 * @return {boolean} True if the polygon is valid (non self-intersecting).
 */
weapi.Polygon.prototype.isValid = function() {
  return this.valid_;
};


/**
 * @return {boolean} True if the polygon CCW/CW orientation was just changed.
 */
weapi.Polygon.prototype.orientationChanged = function() {
  var oldVal = this.pointSwitchFlag_;
  this.pointSwitchFlag_ = false;
  return oldVal;
};


/**
 * @return {number} Rough area of the polygon in m^2.
 */
weapi.Polygon.prototype.getRoughArea = function() {
  return this.roughArea_;
};


/**
 * @param {number} lat in degrees.
 * @param {number} lng in degrees.
 * @param {number=} opt_parent Defaults to the last point.
 * @param {boolean=} opt_more More points coming?
 * @return {number} Fixed ID of the new point.
 */
weapi.Polygon.prototype.addPoint = function(lat, lng, opt_parent, opt_more) {
  var vert = new weapi.Polygon.Node(lat, lng);

  if (this.numVertices_ == 0) {
    this.head_ = vert;
    vert.next = vert;
    vert.prev = vert;
  } else {
    var parent = this.vertices_[
        goog.math.clamp(goog.isDefAndNotNull(opt_parent) ?
                        opt_parent : Number.MAX_VALUE,
                        0, this.vertices_.length - 1)];
    if (!parent) {
      parent = this.head_.prev;
    }
    vert.next = parent.next;
    parent.next = vert;
    vert.prev = parent;
    vert.next.prev = vert;
  }
  this.vertices_.push(vert);
  vert.fixedId = this.vertices_.length - 1;
  this.numVertices_++;

  if (opt_more !== true) {
    this.rebufferPoints_();
    this.solveTriangles_();
  }

  return vert.fixedId;
};


/**
 * @param {number} fixedId .
 * @return {!Array.<number>} .
 */
weapi.Polygon.prototype.getNeighbors = function(fixedId) {
  var vert = this.vertices_[fixedId];
  if (!vert) return [];

  return [vert.prev.fixedId, vert.next.fixedId];
};


/**
 * in degrees
 * @param {number} fixedId .
 * @return {!Array.<number>} .
 */
weapi.Polygon.prototype.getCoords = function(fixedId) {
  var vert = this.vertices_[fixedId];
  if (!vert) return [];

  var mod = 180 / Math.PI;
  return [vert.x * mod, vert.y * mod];
};


/**
 * in degrees
 * @return {!Array.<!{lat: number, lng: number}>} .
 */
weapi.Polygon.prototype.getAllCoords = function() {
  var mod = 180 / Math.PI;
  var result = [];

  var vrt = this.head_;
  do {
    result.push({'lat': vrt.y * mod, 'lng': vrt.x * mod});
    vrt = vrt.next;
  } while (vrt != this.head_);

  return result;
};


/**
 * @param {number} fixedId .
 * @param {number} lat in degrees.
 * @param {number} lng in degrees.
 */
weapi.Polygon.prototype.movePoint = function(fixedId, lat, lng) {
  var vert = this.vertices_[fixedId];
  if (!vert) return;

  vert.setLatLng(lat, lng);

  this.rebufferPoints_();
  this.solveTriangles_();
};


/**
 * @param {number} fixedId .
 */
weapi.Polygon.prototype.removePoint = function(fixedId) {
  var vert = this.vertices_[fixedId];
  if (vert) {
    if (this.head_ == vert) {
      this.head_ = (vert == vert.next) ? null : vert.next;
    }
    vert.next.prev = vert.prev;
    vert.prev.next = vert.next;
    delete this.vertices_[fixedId];
    this.numVertices_--;

    this.rebufferPoints_();
    this.solveTriangles_();
  }
};


/**
 * @return {!Array.<number>} Coords of the average of the nodes.
 */
weapi.Polygon.prototype.calcAverage = function() {
  if (!this.head_) return [0, 0];
  var x = 0, y = 0, i = 0;
  var vrt = this.head_;
  do {
    x += vrt.x;
    y += vrt.y;
    i++;
    vrt = vrt.next;
  } while (vrt != this.head_);
  i = i / 180 * Math.PI;
  return [x/i, y/i];
};


/**
 * @return {Array.<number>} Centroid of the polygon or null if not valid.
 */
weapi.Polygon.prototype.calcCentroid = function() {
  if (!this.isValid()) return null;

  var x = 0, y = 0, area = 0;
  var vrt = this.head_;
  do {
    var p1 = vrt, p2 = vrt.next;
    var f = p1.x * p2.y - p2.x * p1.y;
    x += (p1.x + p2.x) * f;
    y += (p1.y + p2.y) * f;
    area += f;

    vrt = vrt.next;
  } while (vrt != this.head_);
  area /= 2;

  var f = (6 * area) / (180 / Math.PI);
  return [x / f, y / f];
};


/**
 * @param {number} lat in degrees.
 * @param {number} lng in degrees.
 * @return {boolean} True if inside the polygon.
 */
weapi.Polygon.prototype.isPointIn = function(lat, lng) {
  var p1x = lng / 180 * Math.PI;
  var p1y = lat / 180 * Math.PI;

  var sign_ = function(p2, p3) {
    return (p1x - p3.x) * (p2.y - p3.y) -
           (p2.x - p3.x) * (p1y - p3.y);
  };
  var found = false;
  goog.array.forEach(this.triangulation_, function(el, i, arr) {
    var b1 = sign_(el[0], el[1]) < 0;
    var b2 = sign_(el[1], el[2]) < 0;
    var b3 = sign_(el[2], el[0]) < 0;

    if ((b1 == b2) && (b2 == b3)) found = true;
  });
  return found;
};


/**
 * Test polygon<->polygon intersection based on the triangulations.
 * TODO: Could be optimized, but seems to be performing very well.
 * @param {!weapi.Polygon} other .
 * @return {boolean} True if the two polygons overlap.
 */
weapi.Polygon.prototype.intersects = function(other) {
  var lineInter = function(a, b, c, d) {
    //test ab<->cd intersection
    var denom = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y);
    var aycy = (a.y - c.y), axcx = (a.x - c.x);
    var p = ((d.x - c.x) * aycy - (d.y - c.y) * axcx) / denom;
    var t = ((b.x - a.x) * aycy - (b.y - a.y) * axcx) / denom;

    return (p > 0 && p < 1 && t > 0 && t < 1);
  };
  var isPointIn = function(p, t) {
    var sign_ = function(p2, p3) {
      return (p.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p.y - p3.y);
    };

    var b1 = sign_(t[0], t[1]) < 0;
    var b2 = sign_(t[1], t[2]) < 0;
    var b3 = sign_(t[2], t[0]) < 0;

    return (b1 == b2) && (b2 == b3);
  };
  return goog.array.find(this.triangulation_, function(triA, iA, arrA) {
    return goog.array.find(other.triangulation_, function(triB, iB, arrB) {
      // any of the edges intersect (3x3 possibilities)
      if (lineInter(triA[0], triA[1], triB[0], triB[1]) ||
          lineInter(triA[0], triA[1], triB[1], triB[2]) ||
          lineInter(triA[0], triA[1], triB[2], triB[0]) ||
          lineInter(triA[1], triA[2], triB[0], triB[1]) ||
          lineInter(triA[1], triA[2], triB[1], triB[2]) ||
          lineInter(triA[1], triA[2], triB[2], triB[0]) ||
          lineInter(triA[2], triA[0], triB[0], triB[1]) ||
          lineInter(triA[2], triA[0], triB[1], triB[2]) ||
          lineInter(triA[2], triA[0], triB[2], triB[0])) return true;

      // all points of A are inside B
      if (isPointIn(triA[0], triB) &&
          isPointIn(triA[1], triB) &&
          isPointIn(triA[2], triB)) return true;

      // all points of B are inside A
      if (isPointIn(triB[0], triA) &&
          isPointIn(triB[1], triA) &&
          isPointIn(triB[2], triA)) return true;

      return false;
    }) !== null;
  }) !== null;
};


/**
 * Buffers the points into GPU buffer.
 * @private
 */
weapi.Polygon.prototype.rebufferPoints_ = function() {
  var vertices = new Array();

  if (!this.head_) return;
  if (this.numVertices_ < 3) return;
  // recalc temporary ids
  /*var vrt = this.head_;
  var nextId = 0;
  do {
    vrt.tmpId = nextId++;
    vrt = vrt.next;
  } while (vrt != this.head_);

  goog.array.forEach(this.vertices_, function(el, i, arr) {
    if (!el) return;
    vertices[3 * el.tmpId + 0] = el.projX;
    vertices[3 * el.tmpId + 1] = el.projY;
    vertices[3 * el.tmpId + 2] = el.projZ;
  });

  var gl = this.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer_);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);*/

  var cartoArray = [];
  var vrt = this.head_;
  do {
    cartoArray.push(new Cesium.Cartographic(vrt.x, vrt.y));
    vrt = vrt.next;
  } while (vrt != this.head_);

  var carteArray =
      Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(cartoArray);
  this.primitive.positions = carteArray;
  //this.primitive.update();
  carteArray.push(carteArray[0]);
  this.primitiveLine.positions = carteArray;
};


/**
 * @private
 */
weapi.Polygon.prototype.solveTriangles_ = function() {
  //return;
  var n = this.numVertices_;
  this.roughArea_ = 0;
  this.triangulation_ = [];

  //this.context.sceneChanged = true;

  this.valid_ = false;
  //test intersection of segments
  if (n > 2) {
    //point p such that p<->p.next is not intersected by any other
    var cleanpoint = null;
    this.valid_ = true;
    var a = this.head_;
    do {
      var localValid = true;
      var b = a.next;
      var c = this.head_;
      do {
        var d = c.next;
        //test ab<->cd intersection
        var denom = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y);
        var p = ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) / denom;
        var t = ((b.x - a.x) * (a.y - c.y) - (b.y - a.y) * (a.x - c.x)) / denom;

        if (p > 0 && p < 1 && t > 0 && t < 1) {
          localValid = false;
        }

        c = d;
      } while (localValid && c != this.head_);
      if (localValid) cleanpoint = a;
      this.valid_ = this.valid_ && localValid;
      a = b;
    } while (a != this.head_);

    if (!this.valid_ && n == 4) {
      //although some lines intersect, we can still solve this for 4 points
      //  by simply swapping some points (unrolling around the clean edge)
      var swapPoints = function(p1, p2) {
        var p1_prev = p1.prev;
        var p2_next = p2.next;
        p1.prev = p2;
        p2.next = p1;

        p1.next = p2_next;
        p2.prev = p1_prev;

        p2_next.prev = p1;
        p1_prev.next = p2;
      };
      if (cleanpoint) swapPoints(cleanpoint, cleanpoint.next);

      this.rebufferPoints_();
      this.valid_ = true;
      this.pointSwitchFlag_ = true;
    }
  }
  this.primitive.show = this.valid_;
  if (!this.valid_) return;

  var signedArea = 0;
  if (n > 0) {
    var a = this.head_;
    do {
      var b = a.next;
      signedArea += a.x * b.y - a.y * b.x;
      a = b;
    } while (a != this.head_);
  }

  //NOTE: this area is wrong, but the sign is correct
  if (signedArea > 0) {
    //CCW ! reverse the points
    this.pointSwitchFlag_ = true;
    for (var i = 0; i < this.vertices_.length; ++i) {
      var v = this.vertices_[i];
      if (v) {
        var tmp = v.next;
        v.next = v.prev;
        v.prev = tmp;
      }
    }
    this.rebufferPoints_();
  }

  var triangles = [];
  var addTriangle = goog.bind(function(v1, v2, v3) {
    triangles.push([v1.tmpId, v2.tmpId, v3.tmpId]);
    this.triangulation_.push([v1, v2, v3]);

    // Calculate triangle area using Heron's formula
    var len = function(u, v) {
      var x_ = u.projX - v.projX;
      var y_ = u.projY - v.projY;
      var z_ = u.projZ - v.projZ;
      return Math.sqrt(x_ * x_ + y_ * y_ + z_ * z_);
    };
    var a = len(v1, v2), b = len(v2, v3), c = len(v3, v1);
    var s = (a + b + c) / 2;
    var T = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    this.roughArea_ += T;
  }, this);

  // Triangulation -- ear clipping method
  if (n < 3) {
  //triangles = [];
  } else if (n == 3) {
    addTriangle(this.head_, this.head_.prev, this.head_.next);
  } else {
    var head = this.head_;

    var Area2 = function(a, b, c) { //Calulates signed area via cross product
      return -((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y));
    };

    var Left = function(a, b, c) {return (Area2(a, b, c) > 0);}; //c left of ab
    var LeftOn = function(a, b, c) {return (Area2(a, b, c) >= 0);};
    var Collinear = function(a, b, c) {return (Area2(a, b, c) == 0);};
    var XOR = function(a, b) {return (a || b) && !(a && b);};

    var IntersectProp = function(a, b, c, d) { //Check proper intersection
      if (Collinear(a, b, c) || Collinear(a, b, d) ||
          Collinear(c, d, a) || Collinear(c, d, b))
        return false;
      return XOR(Left(a, b, c), Left(a, b, d)) &&
             XOR(Left(c, d, a), Left(c, d, b));
    };

    var InCone = function(a, b) { //Is line ab interal
      var a0 = a._prev, a1 = a._next;
      if (LeftOn(a, a1, a0))
        return Left(a, b, a0) && Left(b, a, a1);
      return !(LeftOn(a, b, a1) && LeftOn(b, a, a0));
    };

    var Diagonalie = function(a, b) {
      var c = head, c1;
      do {
        c1 = c._next;
        if ((c != a) && (c1 != a) && (c != b) && (c1 != b) &&
            IntersectProp(a, b, c, c1)) {
          return false;
        }
        c = c._next;
      } while (c != head);
      return true;
    };

    var Diagonal = function(a, b) {
      return InCone(a, b) && InCone(b, a) && Diagonalie(a, b);
    };

    var v0, v1, v2, v3, v4;

    goog.array.forEach(this.vertices_, function(el, i, arr) {
      if (el) {
        el._next = el.next;
        el._prev = el.prev;
      }
    });

    v1 = this.head_;
    do {
      v2 = v1._next;
      v0 = v1._prev;
      v1._ear = Diagonal(v0, v2);
      v1 = v1._next;
    } while (v1 != this.head_);

    var z = 99;
    while (z > 0 && n > 3) {
      z--;
      v2 = head;
      var y = 99;
      var broke;
      do {
        broke = false;
        if (v2._ear) {
          v3 = v2._next;
          v4 = v3._next;
          v1 = v2._prev;
          v0 = v1._prev;
          addTriangle(v3, v2, v1);
          v1._ear = Diagonal(v0, v3);
          v3._ear = Diagonal(v1, v4);
          v1._next = v3;
          v3._prev = v1;
          head = v3; //In case we cut out the head!
          n--;
          broke = true;
        }
        v2 = v2._next;
        y--;
      } while (y > 0 && !broke && v2 != head);
    }
    if (v1 && v3 && v4) {
      addTriangle(v4, v3, v1);
    }
  }

  this.roughArea_ *= weapi.utils.EARTH_RADIUS * weapi.utils.EARTH_RADIUS;
};



/**
 * @param {number} lat in degrees.
 * @param {number} lng in degrees.
 * @param {weapi.Polygon.Node=} opt_next .
 * @param {weapi.Polygon.Node=} opt_prev .
 * @constructor
 */
weapi.Polygon.Node = function(lat, lng, opt_next, opt_prev) {
  /** @type {number} */
  this.x = 0;
  /** @type {number} */
  this.y = 0;

  /** @type {number} */
  this.projX = 0;
  /** @type {number} */
  this.projY = 0;
  /** @type {number} */
  this.projZ = 0;

  this.setLatLng(lat, lng);

  /** @type {?weapi.Polygon.Node} */
  this.next = opt_next || null;
  /** @type {?weapi.Polygon.Node} */
  this.prev = opt_prev || null;

  /** @type {number} */
  this.fixedId = -1;
  /** @type {number} */
  this.tmpId = -1;

  /** @type {boolean} */
  this._ear = false;
  /** @type {?weapi.Polygon.Node} */
  this._next = this.next;
  /** @type {?weapi.Polygon.Node} */
  this._prev = this.prev;
};


/**
 * @param {number} lat in degrees.
 * @param {number} lng in degrees.
 */
weapi.Polygon.Node.prototype.setLatLng = function(lat, lng) {
  this.x = lng / 180 * Math.PI;
  this.y = lat / 180 * Math.PI;

  var cosy = Math.cos(this.y);
  this.projX = Math.sin(this.x) * cosy;
  this.projY = Math.sin(this.y);
  this.projZ = Math.cos(this.x) * cosy;
};
