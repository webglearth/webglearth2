/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.MiniGlobe');

goog.require('goog.dom');



/**
 * @param {!weapi.App} app .
 * @param {number} latBands .
 * @param {number} lngBands .
 * @param {string} textureUrl .
 * @constructor
 */
weapi.MiniGlobe = function(app, latBands, lngBands, textureUrl) {
  /**
   * @type {!weapi.App}
   * @private
   */
  this.app_ = app;

  /**
   * @type {!HTMLCanvasElement}
   */
  this.canvas =
      /** @type {!HTMLCanvasElement} */(goog.dom.createElement('canvas'));

  var par = this.app_.canvas.parentElement || window.document;
  goog.dom.append(par, this.canvas);

  var opts = {'depth': false, 'preserveDrawingBuffer': true};

  /**
   * @type {?WebGLRenderingContext}
   */
  this.gl = /** @type {?WebGLRenderingContext} */
      (this.canvas.getContext('webgl', opts) ||
       this.canvas.getContext('experimental-webgl', opts));

  var gl = this.gl;

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.clearColor(0.0, 0.0, 0.0, 0.0);

  this.vertexBuffer_ = gl.createBuffer();

  var radius = 1;
  var vertexPositionData = [], textureCoordData = [], indexData = [];
  for (var latNumber = 0; latNumber <= latBands; latNumber++) {
    var theta = latNumber * Math.PI / latBands;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);

    for (var longNumber = 0; longNumber <= lngBands; longNumber++) {
      var phi = longNumber * 2 * Math.PI / lngBands;
      phi -= Math.PI / 2;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);

      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;
      var u = 1 - (longNumber / lngBands);
      var v = 1 - (latNumber / latBands);

      textureCoordData.push(u);
      textureCoordData.push(v);
      vertexPositionData.push(radius * x);
      vertexPositionData.push(radius * y);
      vertexPositionData.push(radius * z);
    }
  }

  for (var latNumber = 0; latNumber < latBands; latNumber++) {
    for (var longNumber = 0; longNumber < lngBands; longNumber++) {
      var first = (latNumber * (lngBands + 1)) + longNumber;
      var second = first + lngBands + 1;
      indexData.push(first + 1);
      indexData.push(second);
      indexData.push(first);

      indexData.push(first + 1);
      indexData.push(second + 1);
      indexData.push(second);
    }
  }

  this.vertexBuffer_ = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer_);
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(vertexPositionData), gl.STATIC_DRAW);
  this.vertexBuffer_.itemSize = 3;
  this.vertexBuffer_.numItems = vertexPositionData.length / 3;

  this.texCoordBuffer_ = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer_);
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(textureCoordData), gl.STATIC_DRAW);
  this.texCoordBuffer_.itemSize = 2;
  this.texCoordBuffer_.numItems = textureCoordData.length / 2;

  this.indexBuffer_ = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(indexData), gl.STATIC_DRAW);
  this.indexBuffer_.itemSize = 1;
  this.indexBuffer_.numItems = indexData.length;

  /**
   * @type {?WebGLTexture}
   * @private
   */
  this.texture_ = null;

  var image_ = new Image();
  image_.onload = goog.bind(function() {
    this.texture_ = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_2D, this.texture_);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image_);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }, this);
  image_.src = textureUrl;

  var fsCode = 'precision lowp float;' +
               'varying vec2 vTextureCoord;' +
               'uniform sampler2D uSampler;' +
               'void main(){gl_FragColor=texture2D(uSampler,vTextureCoord);}';
  var vsCode = 'precision mediump float;' +
               'attribute vec3 aVertexPosition;' +
               'attribute vec2 aTextureCoord;' +
               'uniform mat4 uMVMatrix;' +
               'uniform mat4 uPMatrix;' +
               'uniform float uAspect;' +
               'varying vec2 vTextureCoord;' +
               'void main(){' +
               'gl_Position=uPMatrix*uMVMatrix*vec4(aVertexPosition,1.0);' +
               'gl_Position.x*=uAspect;' +
               'gl_Position.z=0.0;' +
               'vTextureCoord=aTextureCoord;' +
               '}';

  var createShader = function(shaderCode, shaderType) {
    var shader = gl.createShader(shaderType);

    gl.shaderSource(shader, shaderCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw Error('Shader err: ' + gl.getShaderInfoLog(shader));
    } else if (goog.isNull(shader)) {
      throw Error('Unknown');
    }

    return shader;
  };

  var fsshader = createShader(fsCode, gl.FRAGMENT_SHADER);
  var vsshader = createShader(vsCode, gl.VERTEX_SHADER);

  this.program_ = gl.createProgram();
  if (goog.isNull(this.program_)) {
    throw Error('Unknown');
  }
  gl.attachShader(this.program_, vsshader);
  gl.attachShader(this.program_, fsshader);

  gl.bindAttribLocation(this.program_, 0, 'aVertexPosition');

  gl.linkProgram(this.program_);

  if (!gl.getProgramParameter(this.program_, gl.LINK_STATUS)) {
    throw Error('Shader program err: ' +
        gl.getProgramInfoLog(this.program_));
  }

  gl.useProgram(this.program_);

  this.vertexPositionAttribute =
      gl.getAttribLocation(this.program_, 'aVertexPosition');
  this.textureCoordAttribute =
      gl.getAttribLocation(this.program_, 'aTextureCoord');

  this.aspectUniform = gl.getUniformLocation(this.program_, 'uAspect');
  this.pMatrixUniform = gl.getUniformLocation(this.program_, 'uPMatrix');
  this.mvMatrixUniform = gl.getUniformLocation(this.program_, 'uMVMatrix');
  this.samplerUniform = gl.getUniformLocation(this.program_, 'uSampler');

  /**
   * @type {number}
   * @private
   */
  this.size_ = 128;

  /**
   * @type {number}
   * @private
   */
  this.padding_ = 0.1;
};


/**
 * @param {number} size Size of the mini globe in pixels.
 * @param {number=} opt_padding Relative padding (0.1 ~= 10% padding).
 */
weapi.MiniGlobe.prototype.setSize = function(size, opt_padding) {
  this.size_ = size;
  if (goog.isDefAndNotNull(opt_padding)) this.padding_ = opt_padding;
  this.canvas.width = this.size_;
  this.canvas.height = this.size_;
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

  var pad = this.padding_ * this.size_;
  this.canvas.style.cssText = 'position:absolute;z-index:10000;' +
                              'pointer-events:none;' +
                              'right:' + pad + 'px;bottom:' + pad + 'px;';
};


/**
 * @param {!CanvasRenderingContext2D} dst .
 */
weapi.MiniGlobe.prototype.drawToCanvas2D = function(dst) {
  var cornerOff = this.size_ * (1 + this.padding_);
  var x = this.app_.canvas.width - cornerOff;
  var y = this.app_.canvas.height - cornerOff;
  dst.drawImage(this.canvas, x, y);
};


/**
 * Draw
 */
weapi.MiniGlobe.prototype.draw = function() {
  if (!goog.isDefAndNotNull(this.texture_)) return;
  var gl = this.gl;
  gl.useProgram(this.program_);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.texture_);
  gl.uniform1i(this.samplerUniform, 0);

  var rotate100 = function(what, angle) {
    var c = Math.cos(angle), s = Math.sin(angle);

    Cesium.Matrix4.multiply(what, new Cesium.Matrix4(
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
        ), what);
  };

  var rotate010 = function(what, angle) {
    var c = Math.cos(angle), s = Math.sin(angle);

    Cesium.Matrix4.multiply(what, new Cesium.Matrix4(
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
        ), what);
  };

  var pos = this.app_.camera.getPos();
  var frustum = this.app_.camera.camera.frustum;

  var mvm = Cesium.Matrix4.fromTranslation(new Cesium.Cartesian3(
      0, 0, -1.3 / Math.tan(frustum.fovy / 2)));
  rotate100(mvm, pos[0]);
  rotate010(mvm, -pos[1]);


  var pm = new Float32Array(goog.array.flatten(
      Cesium.Matrix4.toArray(frustum.projectionMatrix)));

  gl.uniformMatrix4fv(this.mvMatrixUniform, false, new Float32Array(
      goog.array.flatten(Cesium.Matrix4.toArray(mvm))));
  gl.uniformMatrix4fv(this.pMatrixUniform, false, pm);
  gl.uniform1f(this.aspectUniform, frustum.aspectRatio);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer_);
  gl.vertexAttribPointer(this.vertexPositionAttribute,
                         this.vertexBuffer_.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer_);
  gl.vertexAttribPointer(this.textureCoordAttribute,
                         this.texCoordBuffer_.itemSize, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(this.vertexPositionAttribute);
  gl.enableVertexAttribArray(this.textureCoordAttribute);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_);
  gl.drawElements(gl.TRIANGLES, this.indexBuffer_.numItems,
                  gl.UNSIGNED_SHORT, 0);

  gl.disableVertexAttribArray(this.vertexPositionAttribute);
  gl.disableVertexAttribArray(this.textureCoordAttribute);
};
