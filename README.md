# WebGL Earth 2.0

## Install
* Cesium is added as submodule (should download automatically) -- use `make cesium` to create the required build.

## Running the app
* Run `make serve` to start the plovr server (port 9810)
* Open any of `src/*.html`

## Build the app
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

## API
Individual API methods are not yet documented -- the best source of the information are currently the API examples (`src/api.html`, `src/api-l.html`, `src/polygon.html`) and the API symbol exports itselves (`src/api.js` and `src/api-l.js`).