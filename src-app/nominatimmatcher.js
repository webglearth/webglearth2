/*
 * Copyright (C) 2011 Klokan Technologies GmbH (info@klokantech.com)
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
 * @fileoverview Class that retrieves autocomplete matches from Nominatim
 * geocoder service.
 *
 * @author petr.pridal@klokantech.com (Petr Pridal)
 */

goog.provide('klokantech.NominatimMatcher');

goog.require('goog.net.Jsonp');



/**
 * An array matcher that requests matches via JSONP.
 * @param {string=} opt_url The Uri of the web service.
 * @param {Object.<string, string>=} opt_payload The list of extra parameters
     for the Jsonp request.
 * @constructor
 */
klokantech.NominatimMatcher = function(opt_url, opt_payload) {

  /**
   * The url of the Nominatim instance
   * @type {string}
   * @private
   */
  this.url_ = opt_url || 'http://open.mapquestapi.com/nominatim/v1/search';

  /**
   * The list of extra parameters for the Jsonp request
   * @type {!Object}
   * @private
   */
  this.payload_ = opt_payload || {};

  /**
   * The Jsonp object used for making remote requests.  When a new request
   * is made, the current one is aborted and the new one sent instead.
   * @type {!goog.net.Jsonp}
   * @private
   */
  this.jsonp_ = new goog.net.Jsonp(this.url_, 'json_callback');
};


/**
 * Retrieve a set of matching rows from the server via JSONP and convert them
 * into rich rows.
 * @param {string} token The text that should be matched; passed to the server
 *     as the 'token' query param.
 * @param {number} maxMatches The maximum number of matches requested from the
 *     server; passed as the 'max_matches' query param.  The server is
 *     responsible for limiting the number of matches that are returned.
 * @param {Function} matchHandler Callback to execute on the result after
 *     matching.
 */
klokantech.NominatimMatcher.prototype.requestMatchingRows =
    function(token, maxMatches, matchHandler) {

  this.payload_['q'] = token;
  this.payload_['format'] = 'json';
  this.payload_['addressdetails'] = 1;
  this.payload_['limit'] = maxMatches;

  // Ignore token which is empty or just one letter
  if (!token || token.length == 1) {
    matchHandler(token, []);
    return;
  }

  // After direct request cancel autocomplete
  if (maxMatches == 1) this.oldtoken_ = token;
  if (maxMatches > 1 && token === this.oldtoken_) return;

  // Cancel old request when we have a new one
  if (this.request_ !== null) this.jsonp_.cancel(this.request_);

  this.request_ = this.jsonp_.send(this.payload_, function(e) {
    // If there is one or more "place" then return only these
    var places = goog.array.filter(e, function(r) {
      return ((r['class'] == 'place' ||
          r['class'] == 'highway' ||
          r['class'] == 'boundary') &&
                 r['type'] !== 'state' &&
                 r['type'] !== 'country');
    });
    var rest = goog.array.filter(e, function(r) {
      return (r['class'] !== 'place' && r['class'] !== 'highway');
    });

    // extract the information relevant for our needs
    var extractRelevant = function(results) {
      var newResults = [];
      goog.array.forEach(results, function(el, i, arr) {
        var bb = el['boundingbox'];
        newResults.push({
          'formatted_address': el['display_name'],
          'type': el['type'],
          'bounds': bb ? [parseFloat(bb[2]), parseFloat(bb[0]),
                            parseFloat(bb[3]), parseFloat(bb[1])] : null,
          //'boundingbox': el['boundingbox'],
          'viewport': null});
      }, this);
      return newResults;
    };

    if (places.length > 0) {
      // Fix the "display_name"
      goog.array.forEach(places, function(r) {
        if (r['address']['country_code'] == 'us') {
          var country = r['address']['state']; // + ', USA';
        } else if (r['address']['country_code'] == 'gb') {
          var country = 'UK';
        } else if (r['address']['country_code'] == 'de') {
          var country = 'Germany';
        } else {
          var country = r['address']['country'];
        }
        var town = (r['address']['city'] ? r['address']['city'] :
            (r['address']['town'] ? r['address']['town'] :
            (r['address']['village'] ? r['address']['village'] :
             r['address']['hamlet'])));

        if (r['type'] == 'suburb') {
          var s = r['address']['suburb'] +
                  (town ? ', ' + town : '') + ', ' + country;
        }

        if (r['type'] == 'city' ||
            r['type'] == 'town' ||
            r['type'] == 'village' ||
            r['type'] == 'hamlet') {
          var s = town + ', ' + country;
        } else if (r['osm_type'] == 'way') {
          var s = (r['address']['road'] ? r['address']['road'] :
                   r['address']['pedestrian']) + ', ' + town + ', ' + country;
        } else if (r['type'] == 'house') {
          var s = r['address']['road'] + ' ' + r['address']['house_number'] +
                  ', ' + town + ', ' + country;
        } else {
          var s = r['display_name'];
        }
        r['display_name'] = s;
      });
      matchHandler(token, extractRelevant(goog.array.concat(places, rest)));
    } else {
      matchHandler(token, extractRelevant(e));
    }
  });
};
