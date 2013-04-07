/*
 * Copyright (C) 2012 Klokan Technologies GmbH (info@klokantech.com)
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU GPL for more details.
 *
 * USE OF THIS CODE OR ANY PART OF IT IN A NONFREE SOFTWARE IS NOT ALLOWED
 * WITHOUT PRIOR WRITTEN PERMISSION FROM KLOKAN TECHNOLOGIES GMBH.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 */

/**
 * @fileoverview Serves for extended saving of canvas content as png.
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 */

goog.provide('we.canvas2image');


// Modified version of
//  http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js
(function(view) {
  'use strict';
  var is_base64_regex = /\s*;\s*base64\s*(?:;|$)/i,
      base64_ranks = new Uint8Array([
        62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1,
        -1, -1, 0, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
        -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
        36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
      ]),
      decode_base64 = function(base64) {
        var len = base64.length,
            buffer = new Uint8Array(len / 4 * 3 | 0),
            i = 0,
            outptr = 0,
            last = [0, 0],
            state = 0,
            save = 0;

        while (len--) {
          var code = base64.charCodeAt(i++);
          var rank = base64_ranks[code - 43];
          if (rank !== 255 && rank !== undefined) {
            last[1] = last[0];
            last[0] = code;
            save = (save << 6) | rank;
            state++;
            if (state === 4) {
              buffer[outptr++] = save >>> 16;
              if (last[1] !== 61 /* padding character */) {
                buffer[outptr++] = save >>> 8;
              }
              if (last[0] !== 61 /* padding character */) {
                buffer[outptr++] = save;
              }
              state = 0;
            }
          }
        }
        // 2/3 chance there's going to be some null bytes at the end, but that
        // doesn't really matter with most image formats.
        // If it somehow matters for you, truncate the buffer up outptr.
        return buffer.buffer;
      };

  if (HTMLCanvasElement && !HTMLCanvasElement.prototype.toBlob) {
    HTMLCanvasElement.prototype.toBlob = function(callback, type) {
      if (!type) {
        type = 'image/png';
      } if (this['mozGetAsFile']) {
        callback(this['mozGetAsFile']('canvas', type));
        return;
      }
      var args = Array.prototype.slice.call(arguments, 1),
          dataURI = this.toDataURL.apply(this, args),
          header_end = dataURI.indexOf(','),
          data = dataURI.substring(header_end + 1),
          is_base64 = is_base64_regex.test(dataURI.substring(0, header_end)),
          BlobBuilder = view['BlobBuilder'] ||
                        view['WebKitBlobBuilder'] || view['MozBlobBuilder'],
          bb = new BlobBuilder;

      if (is_base64) {
        bb.append(decode_base64(data));
      } else {
        bb.append(decodeURIComponent(data));
      }

      callback(bb.getBlob(type));
    };
  }
}(self));

// Modified version of (stripped IE support and general cleaning):
//  http://hackworthy.blogspot.cz/2012/05/savedownload-data-generated-in.html
var showSave_;
var BlobBuilder_ = window['BlobBuilder'] ||
    window['WebKitBlobBuilder'] || window['MozBlobBuilder'];
var URL_ = window['URL'] || window['webkitURL'] || window['mozURL'];
var saveBlob_ = navigator['saveBlob'] ||
                navigator['mozSaveBlob'] || navigator['webkitSaveBlob'];
var saveAs_ = window['saveAs'] || window['webkitSaveAs'] || window['mozSaveAs'];

if (BlobBuilder_ && (saveAs_ || saveBlob_)) {
  showSave_ = function(data, name, mimetype) {
    var builder = new BlobBuilder_();
    builder.append(data);
    var blob = builder['getBlob'](mimetype || 'application/octet-stream');
    if (!name) name = 'Download.bin';
    if (saveAs_) {
      saveAs_(blob, name);
    } else {
      saveBlob_(blob, name);
    }
  };
} else if (BlobBuilder_ && URL_) {
  showSave_ = function(data, name, mimetype) {
    var blob, url, builder = new BlobBuilder_();
    builder.append(data);
    if (!mimetype) mimetype = 'application/octet-stream';
    if ('download' in document.createElement('a')) {
      blob = builder['getBlob'](mimetype);
      url = URL_['createObjectURL'](blob);
      var link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', name || 'Download.bin');
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0,
                           false, false, false, false, 0, null);
      link.dispatchEvent(event);
    } else {
      // mime types that don't trigger a download when opened in a browser:
      var BrowserSupportedMimeTypes = {
        'image/jpeg': true,
        'image/png': true,
        'image/gif': true,
        'image/svg+xml': true,
        'image/bmp': true,
        'image/x-windows-bmp': true,
        'image/webp': true,
        'audio/wav': true,
        'audio/mpeg': true,
        'audio/webm': true,
        'audio/ogg': true,
        'video/mpeg': true,
        'video/webm': true,
        'video/ogg': true,
        'text/plain': true,
        'text/html': true,
        'text/xml': true,
        'application/xhtml+xml': true,
        'application/json': true
      };
      if (BrowserSupportedMimeTypes[mimetype.split(';')[0]] === true) {
        mimetype = 'application/octet-stream';
      }
      blob = builder['getBlob'](mimetype);
      url = URL_['createObjectURL'](blob);
      window.open(url, '_blank', '');
    }
    setTimeout(function() {
      URL_['revokeObjectURL'](url);
    }, 250);
  };
}


/**
 *
 * @param {!HTMLCanvasElement} canvas .
 * @param {weapi.markers.MarkerManager=} opt_markerMgr .
 * @param {weapi.MiniGlobe=} opt_miniGlobe .
 * @return {!HTMLCanvasElement} Canvas with possibly additional content.
 */
we.canvas2image.prepareCanvas = function(canvas, opt_markerMgr, opt_miniGlobe) {
  var canvas_ = canvas;
  if (opt_markerMgr || opt_miniGlobe) {
    canvas_ = goog.dom.createElement('canvas');
    canvas_.width = canvas.width;
    canvas_.height = canvas.height;
    var ctx = /** @type {!CanvasRenderingContext2D} */
        (canvas_.getContext('2d'));
    ctx.drawImage(canvas, 0, 0);
    if (opt_markerMgr) {
      opt_markerMgr.forEach(function(marker) {
        marker.draw2D(ctx);
      });
    }
    if (opt_miniGlobe) {
      opt_miniGlobe.drawToCanvas2D(ctx);
    }
  }
  return /** @type {!HTMLCanvasElement} */(canvas_);
};


/**
 * Offers the user to save the png image
 *   as if it was a regular download from the server.
 * Custom filename may not be supported by the browser.
 * @param {!HTMLCanvasElement} canvas .
 * @param {string} filename .
 */
we.canvas2image.saveCanvasAsPNG = function(canvas, filename) {
  if (showSave_ && canvas.toBlob) {
    canvas.toBlob(function(blob) {
      showSave_(blob, filename, 'image/png');
    }, 'image/png');
  } else if (canvas.toDataURL) {
    var strData = canvas.toDataURL();
    document.location.href = strData.replace('image/png', 'image/octet-stream');
  }
};


/**
 * @param {!HTMLCanvasElement} canvas .
 * @return {string} 'data:image/png...' representation of the canvas content.
 */
we.canvas2image.getCanvasAsDataURL = function(canvas) {
  return canvas.toDataURL ? canvas.toDataURL() : 'data:image/png,';
};
