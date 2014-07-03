[![WebGL Earth](https://cloud.githubusercontent.com/assets/59284/3467435/90001280-0290-11e4-9d6f-04fa4479cea0.png)](http://www.webglearth.com/)

# WebGL Earth 2.0

Open-source virtual planet web application running in any web browser with support for WebGL HTML5 standard. Mobile devices such as iPhone, iPad or Android based mobile phones are going to be supported too. It is a free software and a community driven project.

There is an extremely easy to use JavaScript API - fully mimicking LeafletJS.

See: http://examples.webglearth.org/ for demos.

## Contracted development and support

Contact: info@klokantech.com

## Usage

### JavaScript API

WebGL Earth in version 2.0 is adapting the popular LeafletJS API. So if you are familiar with Leaflet you can easily start to use WebGL Earth, things like markers, popups, centering and flying to a place on given latitude and longitude are possible. The code from Leaflet can be also mixed with WE - you can pass L.LatLng and L.LatLngBounds, etc.

A simple Hello World:

```html
<!DOCTYPE HTML>
<html>
  <head>
    <script src="http://www.webglearth.com/v2/api.js"></script>
    <script>
      function initialize() {
        var earth = new WE.map('earth_div');
        WE.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(earth);
      }
    </script>
  </head>
  <body onload="initialize()">
    <div id="earth_div" style="width:600px;height:400px;"></div>
  </body>
</html>
```
More examples are at: http://examples.webglearth.org/.

Original version of WebGL Earth had also it's own easy API which is preserved for back compatibility.
It is documented at http://www.webglearth.org/api.

The supported Leaflet API methods are not yet documented -- the best source of the information are currently the API examples (`src/api-l.html`, `src/api.html`, `src/polygon.html`) and the API symbol exports itselves (`src/api.js` and `src/api-l.js`).

### Online hosted API

The project API is available from Google CDN and can be linked and called directly from your web application as `http://www.webglearth.com/v2/api.js`. Examples mentioned above are demonstrating this form of use.

Embedding of a globe in your own web is then extremely easy.

### From custom server or even offline 

Because the project is 100% open-source, the complete code can be hosted also on your own website or distributed with applications. Ready to use API releases are at: https://github.com/webglearth/webglearth2/releases

With custom rendered map tiles (made with http://www.maptiler.com/) the project can be used on intranets, in restricted environments or even offline. The API should be accessed via HTTP protocol (possibly via localhost).


## Development and building 

* Clone the code from GitHub, including the submodules (cesium).
* Use `make cesium` to build the required component.

### Running the app
* Run `make serve` to start the plovr server (port 9810)
* Open any of `src/*.html`

### Build the app
* Run `make build` to produce `deploy/*_nocesium.js`
* Combine the sources together to produce a single JavaScript file:

```
/**
 * WebGL Earth 2.0
 * ===============
 * Copyright (C) 2014 - Klokan Technologies GmbH
 * http://www.webglearth.org/
 * Powered by Cesium (http://www.webglearth.org/cesium). Apache 2.0 license.
 */

CESIUM_BASE_URL = '.';
{content of cesium/Build/Cesium/Cesium.js}
{content of deploy/api_nocesium.js}
```
