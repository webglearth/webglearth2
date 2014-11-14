/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapi.markers.PrettyMarker');

goog.require('goog.dom');
goog.require('goog.style');

goog.require('weapi.markers.AbstractMarker');
goog.require('weapi.markers.Popup');
goog.require('weapi.utils');



/**
 * @inheritDoc
 * @param {number} lat .
 * @param {number} lon .
 * @param {string=} opt_iconUrl URL of the icon to use instead of the default.
 * @param {number=} opt_width Width of the icon.
 * @param {number=} opt_height Height of the icon.
 * @extends {weapi.markers.AbstractMarker}
 * @constructor
 */
weapi.markers.PrettyMarker = function(lat, lon,
                                      opt_iconUrl, opt_width, opt_height) {

  var marker = goog.dom.createDom('div', {'class': 'we-pm-icon'});

  if (goog.isString(opt_iconUrl))
    marker.style.backgroundImage = 'url(' + opt_iconUrl + ')';

  this.width_ = opt_width || 25;
  this.height_ = opt_height || 41;

  marker.style.width = this.width_.toFixed(0) + 'px';
  marker.style.height = this.height_.toFixed(0) + 'px';
  marker.style.marginLeft = (-this.width_ / 2).toFixed(0) + 'px';
  marker.style.marginTop = (-this.height_).toFixed(0) + 'px';

  //wrapper for marker and popup
  var elwrap = goog.dom.createDom('div', {style: 'position:absolute;'},
                                  marker);

  goog.base(this, lat, lon, /** @type {!HTMLElement} */ (elwrap));

  /**
   * @type {weapi.markers.Popup}
   * @private
   */
  this.popup_ = null;

  this.show(false);
  this.showPopup(false);

  marker.onclick = goog.bind(this.showPopup, this, undefined);

};
goog.inherits(weapi.markers.PrettyMarker, weapi.markers.AbstractMarker);


/**
 * Bind the popup to this marker.
 * @param {!weapi.markers.Popup} popup Popup to bind.
 */
weapi.markers.PrettyMarker.prototype.attachPopup = function(popup) {
  if (this.popup_) goog.dom.removeNode(this.popup_.getElement());

  this.popup_ = popup;
  goog.dom.appendChild(this.element, this.popup_.getElement());
  popup.adjust(this.height_);
};


/**
 * Shows or hides the popup.
 * @param {boolean=} opt_visible Visible? If not given, toggle.
 */
weapi.markers.PrettyMarker.prototype.showPopup = function(opt_visible) {
  if (this.popup_) {
    //var popup = this.popup_.getElement();
    //center the popup
    //popup.style.left = -Math.round((popup.offsetWidth -
    //    this.element.offsetWidth) / 2) + 'px';

    this.popup_.show(opt_visible);
  }
};


weapi.utils.installStyles(
    '.we-pm-icon{position:absolute;z-index:64;background-image:url(data:image' +
    '/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFtklEQVR42p3W' +
    'a0xTZxgH8CYkS5aQLGFxcXNZNNu4FIFCK9eCWOQm3lDizLYP+zTnxLk5wQpICxRaLuWi3FpQ' +
    'FMU55xDkjiBTFMeA9Zy2JzMxWUZisoS4TyRuQvG/pydQKb3Q2uSXw3nf93n+5z2nLRVIiga8' +
    '8RERL/MlAgDrosJ+d/zISTJMEFt2B9LyEV5kySBo7G+iI9vdhyj7nfEhcjKfUvcAma0z+Pwa' +
    '5+BwuxG7myaRUH4XtHaAhLgI6VvLjwwn14zj0CUWn13lkHXZhPQWBml6e3svGq3zvIyGX0F1' +
    'z0mWQ4hY0buaH3mcUvsAn17hcKDNhFQdsy4K5Nfv108jsXIM1OOoqxAfMppMAYepIF3PIrmZ' +
    '8cqhy2ZkXjBYQyxE9iqksGeFXKa9h0PtHF0di6Qmxhk+fKeLOcLX72r8DdRvjvjxIRGFt638' +
    'yPz+Vha7W0zY0cDYydAbkXWJ4+1rYWx/H2gzO6wl/JysehzUUw0+5Oxtq+zEyns42MYhsZ6x' +
    'Q2N0C0yQae9DouhFZt1dOvYgnt5RGU3T/Dw1tqtJ1xn5Gur7D/ERRBR0W43vapzhd5FwnrHZ' +
    '02Kmt+jvkBTeRsOdPzD/7wJWXkPGp0hSD2BnzUMcuMjZ1RF+LFY1BOotFYQXdPkSy/5WDvF1' +
    'DKSr8GOau7g1/RecvWafzSOuuBf79CYkNxodandox0G9VYLw/FvCSGUf9rZQci1js6PeiPRG' +
    'Aw7WjTgNePnyJa9mgJ5h1QPsWVOf0kTBdZOg/p0CUV6nNKp4ALv1HKJrGJu0Znqo1RNQds64' +
    'DLBYLBjjniK6ZMihXtZgRPK5KVD/UYHozM+R1p1k6DhEaRmblAYK0U4g/8aUy4DFxUUMMLOI' +
    'UQ071CfVm5BUOwnq30shNzeJC7qwq5nDtirGJq6GRWoDixR1HxYsS3YhS0tLWFhY4OVdf4TE' +
    'qgmkNprt6ukiafwhqL9OECb/yYfMpzaaEKllIa5kbNKa6D6XjqK632i3C9oBH3DPPIttyn5+' +
    'XUy1Y22cegzUO18QdvqGVWdC5SNK5xBezqyg3dB9pW1Hl4wgu20cM3/O4b+FRTx++gwNgywk' +
    'eTfhrE5cwfBj4oJuUG+hIDT3RyuZpLAXO+s5hGkYOzHVRn5cWv4Q4rM91iJE5HchpnQMsjrW' +
    'WY1tPfUd5j/xoTnXV0zEV05Cds6MUDVjR6RhkXSecxBTbXJYG0ZojnbRA+opXQ75YUWmpLCf' +
    'ro7D1lLmdfH1Us0EqN+o7Vs45NS1FT7kSXzVDGK1ZghVzGtJpJAI2gX1Sn4V8n3HakcliiEk' +
    '1HIILGG8FldtRqxmEtRn2u6f1taTHau9SebitCzCNUb4FzNekdZwCC/oA/XIsg/57upaKrFi' +
    'BHFaDh8rGY9FVZgRrZ4C1T8mPnYhwd9eWWsDeR5TaUKwyogPFYxHYqo4iPL7QbVf8M3tQ9qd' +
    '0UUoxhBdyWFLIbOucLUJkeoZUN0secMx5MRlZwKIhW4BXSWLzWcZt6IqrLsYBNWccPq7S/jN' +
    'JVe6wxX3sU1jxgf5BpeExUZIygyg9XPE13nI8TZXtm89dRNiCnk/z+AKPx+aNwhaX+jyZ2pQ' +
    '9kV3JkTKRxCVmrDpjMGBv4JFRBkLWjdP3nITcsGdT4JzuiAqM+NduWEtfjzkzBBoXQXf0GXI' +
    'sVZ3fMiTsKIpBBYZsfG0wWZzAQuRygSaf0E2ug0J/LplPdnBOT0IVZnxTq5hBX8eLB8Gzev4' +
    'Zu5D9OvxJXMhRQZsoavfkEPPQ84gpMQEGreQLeuGBBzVe0IVlDuA4GIz3j5l4I9B8hHQeIfb' +
    'AFvIVzpPbCQvhEoT3pOzEBaZEZh9BTQW4mFIs6d0gbl3EKSkAPkY6LyXCDwLOdLsKWHAsXYE' +
    'KswIOH4NdC4lnoX4H2nyRnfA6THQ8Zflcw9Dvmz0xnb/7A7QMW353OMQb7USgTch/wNGSWfR' +
    'l/HE1wAAAABJRU5ErkJggg==);}'
);
