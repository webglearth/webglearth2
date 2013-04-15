/**
 * @externs
 * @see http://cesium.agi.com/
 */
var Cesium = {};



/**
 * @constructor
 */
Cesium.Billboard = function() {};


/**
 * @param {!Cesium.Cartesian3} pos .
 */
Cesium.Billboard.prototype.setPosition = function(pos) {};


/**
 * @param {boolean} show .
 */
Cesium.Billboard.prototype.setShow = function(show) {};


/**
 * @param {number} scale .
 */
Cesium.Billboard.prototype.setScale = function(scale) {};


/**
 * @param {number} index .
 */
Cesium.Billboard.prototype.setImageIndex = function(index) {};


/**
 * @constructor
 */
Cesium.BillboardCollection = function() {};


/**
 * @param {Object=} opt_opts .
 * @return {Cesium.Billboard} .
 */
Cesium.BillboardCollection.prototype.add = function(opt_opts) {};


/**
 * @param {Cesium.Billboard} what .
 */
Cesium.BillboardCollection.prototype.remove = function(what) {};


/**
 * @param {Cesium.TextureAtlas} what .
 */
Cesium.BillboardCollection.prototype.setTextureAtlas = function(what) {};


/**
 * @constructor
 */
Cesium.TextureAtlas = function() {};


/**
 * @param {Image} image .
 */
Cesium.TextureAtlas.prototype.addImage = function(image) {};


/**
 * @return {Array.<Cesium.BoundingRectangle>} .
 */
Cesium.TextureAtlas.prototype.getTextureCoordinates = function() {};



/**
 * @constructor
 */
Cesium.BoundingRectangle = function() {};


/**
 * @type {number}
 */
Cesium.BoundingRectangle.prototype.x;


/**
 * @type {number}
 */
Cesium.BoundingRectangle.prototype.y;


/**
 * @type {number}
 */
Cesium.BoundingRectangle.prototype.width;


/**
 * @type {number}
 */
Cesium.BoundingRectangle.prototype.height;



/**
 * @constructor
 */
Cesium.Camera = function() {};


/**
 * @type {Cesium.Cartesian3}
 */
Cesium.Camera.prototype.direction;


/**
 * @type {Cesium.PerspectiveFrustrum}
 */
Cesium.Camera.prototype.frustum;

/**
 * @type {Cesium.CameraController}
 */
Cesium.Camera.prototype.controller;


/**
 * @type {Cesium.Cartesian3}
 */
Cesium.Camera.prototype.position;


/**
 * @type {Cesium.Cartesian3}
 */
Cesium.Camera.prototype.right;


/**
 * @type {Cesium.Matrix4}
 */
Cesium.Camera.prototype.transform;


/**
 * @type {Cesium.Cartesian3}
 */
Cesium.Camera.prototype.up;


/**
 * @return {Cesium.Cartesian3} .
 */
Cesium.Camera.prototype.getPositionWC = function() {};


/**
 * @param {Cesium.Cartesian4} cartesian .
 * @param {Cesium.Cartesian4=} opt_result .
 * @return {Cesium.Cartesian4} .
 */
Cesium.Camera.prototype.worldToCameraCoordinates = function(cartesian, opt_result) {};


/**
 * @return {!Cesium.Matrix4}
 */
Cesium.Camera.prototype.getViewMatrix = function() {};



/**
 * @param {Object} canvas .
 * @param {Object} type .
 * @param {Object} mod .
 * @constructor
 */
Cesium.CameraEventAggregator = function(canvas, type, mod) {};


/**
 * @return {boolean} .
 */
Cesium.CameraEventAggregator.prototype.isMoving = function() {};


/**
 * @return {Object} .
 */
Cesium.CameraEventAggregator.prototype.getMovement = function() {};


/**
 * @return {Object} .
 */
Cesium.CameraEventAggregator.prototype.getLastMovement = function() {};


/**
 * @return {boolean} .
 */
Cesium.CameraEventAggregator.prototype.isButtonDown = function() {};


/**
 * @return {number} .
 */
Cesium.CameraEventAggregator.prototype.getButtonPressTime = function() {};


/**
 * @return {number} .
 */
Cesium.CameraEventAggregator.prototype.getButtonReleaseTime = function() {};


/**
 * @return {boolean} .
 */
Cesium.CameraEventAggregator.prototype.isDestroyed = function() {}


/**
 */
Cesium.CameraEventAggregator.prototype.destroy = function() {};



/**
 * @constructor
 */
Cesium.CameraController = function() {};


/**
 * @param {Cesium.Cartographic} carto
 */
Cesium.CameraController.prototype.setPositionCartographic = function(carto) {};


/**
 * @param {Cesium.Cartesian3} eye .
 * @param {Cesium.Cartesian3} target .
 * @param {Cesium.Cartesian3} up .
 */
Cesium.CameraController.prototype.lookAt = function(eye, target, up) {};


/**
 * @param {number} amount .
 */
Cesium.CameraController.prototype.twistLeft = function(amount) {};

/**
 * @param {number} amount .
 */
Cesium.CameraController.prototype.twistRight = function(amount) {};

/**
 * @param {number} amount .
 */
Cesium.CameraController.prototype.lookLeft = function(amount) {};

/**
 * @param {number} amount .
 */
Cesium.CameraController.prototype.lookRight = function(amount) {};

/**
 * @param {number} amount .
 */
Cesium.CameraController.prototype.lookUp = function(amount) {};

/**
 * @param {number} amount .
 */
Cesium.CameraController.prototype.lookDown = function(amount) {};

/**
 * @param {!Cesium.Cartesian2} windowPos .
 * @return {!Cesium.Cartesian3} .
 */
Cesium.CameraController.prototype.pickEllipsoid = function(windowPos) {};


/**
 * @constructor
 * @param {number} x
 * @param {number} y
 */
Cesium.Cartesian2 = function(x, y) {};


/**
 * @type {number}
 */
Cesium.Cartesian2.prototype.x;


/**
 * @type {number}
 */
Cesium.Cartesian2.prototype.y;



/**
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
Cesium.Cartesian3 = function(x, y, z) {};


/**
 * @type {!Cesium.Cartesian3}
 */
Cesium.Cartesian3.UNIT_X;


/**
 * @type {!Cesium.Cartesian3}
 */
Cesium.Cartesian3.UNIT_Y;


/**
 * @type {!Cesium.Cartesian3}
 */
Cesium.Cartesian3.UNIT_Z;


/**
 * @type {!Cesium.Cartesian3}
 */
Cesium.Cartesian3.ZERO;


/**
 * @type {number}
 */
Cesium.Cartesian3.prototype.x;


/**
 * @type {number}
 */
Cesium.Cartesian3.prototype.y;


/**
 * @type {number}
 */
Cesium.Cartesian3.prototype.z;


/**
 * @return {number}
 */
Cesium.Cartesian3.prototype.magnitude = function() {};


/**
 * @param {Cesium.Cartesian3} right
 * @param {Cesium.Cartesian3=} opt_result
 * @return {!Cesium.Cartesian3}
 */
Cesium.Cartesian3.prototype.add = function(right, opt_result) {};


/**
 * @param {Cesium.Cartesian3} right
 * @param {Cesium.Cartesian3=} opt_result
 * @return {!Cesium.Cartesian3}
 */
Cesium.Cartesian3.prototype.subtract = function(right, opt_result) {};


/**
 * @param {Cesium.Cartesian3} cartesian
 * @param {Cesium.Cartesian3} result
 * @return {!Cesium.Cartesian3}
 */
Cesium.Cartesian3.normalize = function(cartesian, result) {};


/**
 * @param {Cesium.Cartesian3=} opt_result
 * @return {!Cesium.Cartesian3}
 */
Cesium.Cartesian3.prototype.normalize = function(opt_result) {};


/**
 * @param {Cesium.Cartesian3} cartesian
 * @param {Cesium.Cartesian3} result
 * @return {!Cesium.Cartesian3}
 */
Cesium.Cartesian3.negate = function(cartesian, result) {};


/**
 * @param {Cesium.Cartesian3=} opt_result
 * @return {!Cesium.Cartesian3}
 */
Cesium.Cartesian3.prototype.negate = function(opt_result) {};


/**
 * @param {Cesium.Cartesian3} left
 * @param {Cesium.Cartesian3} right
 * @param {Cesium.Cartesian3=} opt_result
 * @return {!Cesium.Cartesian3}
 */
Cesium.Cartesian3.cross = function(left, right, opt_result) {};


/**
 * @param {Cesium.Cartesian3} right
 * @param {Cesium.Cartesian3=} opt_result
 * @return {!Cesium.Cartesian3}
 */
Cesium.Cartesian3.prototype.cross = function(right, opt_result) {};


/**
 * @param {Cesium.Cartesian3} left
 * @param {Cesium.Cartesian3} right
 * @return {number}
 */
Cesium.Cartesian3.dot = function(left, right) {};


/**
 * @param {Cesium.Cartesian3} right
 * @param {Cesium.Cartesian3=} opt_result
 * @return {number}
 */
Cesium.Cartesian3.prototype.dot = function(right, opt_result) {};


/**
 * @param {Cesium.Cartesian3} left
 * @param {Cesium.Cartesian3} right
 * @return {number}
 */
Cesium.Cartesian3.angleBetween = function(left, right) {};


/**
 * @param {Cesium.Cartesian3} right
 * @param {Cesium.Cartesian3=} opt_result
 * @return {number}
 */
Cesium.Cartesian3.prototype.angleBetween = function(right, opt_result) {};



/**
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} w
 */
Cesium.Cartesian4 = function(x, y, z, w) {};


/**
 * @type {number}
 */
Cesium.Cartesian4.prototype.x;


/**
 * @type {number}
 */
Cesium.Cartesian4.prototype.y;


/**
 * @type {number}
 */
Cesium.Cartesian4.prototype.z;

/**
 * @type {number}
 */
Cesium.Cartesian4.prototype.w;



/**
 * @constructor
 * @param {number=} longitude
 * @param {number=} latitude
 * @param {number=} height
 */
Cesium.Cartographic = function(longitude, latitude, height) {};


/**
 * @type {number}
 */
Cesium.Cartographic.prototype.longitude;


/**
 * @type {number}
 */
Cesium.Cartographic.prototype.latitude;


/**
 * @type {number}
 */
Cesium.Cartographic.prototype.height;


/**
 * @param {number} lat .
 * @param {number} lng .
 * @return {!Cesium.Cartographic}
 */
Cesium.Cartographic.fromDegrees = function(lat, lng) {};



/**
 * @constructor
 * @param {Cesium.Ellipsoid} ellipsoid
 */
Cesium.CentralBody = function(ellipsoid) {};


/**
 * @return {Cesium.ImageryLayerCollection}
 */
Cesium.CentralBody.prototype.getImageryLayers = function() {};


/**
 * @return {Cesium.Ellipsoid}
 */
Cesium.CentralBody.prototype.getEllipsoid = function() {};



/**
 * @constructor
 */
Cesium.Polygon = function() {};


/**
 * @param {!Array.<!Cesium.Cartesian3>} positions .
 */
Cesium.Polygon.prototype.setPositions = function(positions) {};


/**
 * @type {boolean} .
 */
Cesium.Polygon.prototype.show;



/**
 * @constructor
 */
Cesium.PolylineCollection = function() {};


/**
 * @param {Object=} opt_opts .
 * @return {!Cesium.Polyline} .
 */
Cesium.PolylineCollection.prototype.add = function(opt_opts) {};



/**
 * @constructor
 */
Cesium.Polyline = function() {};


/**
 * @param {!Array.<!Cesium.Cartesian3>} positions .
 */
Cesium.Polyline.prototype.setPositions = function(positions) {};


/**
 * @param {!Cesium.Color} color .
 */
Cesium.Polyline.prototype.setColor = function(color) {};


/**
 * @param {number} width .
 */
Cesium.Polyline.prototype.setWidth = function(width) {};



/**
 * @constructor
 */
Cesium.CompositePrimitive = function() {};


/**
 * @return {Cesium.CentralBody}
 */
Cesium.CompositePrimitive.prototype.getCentralBody = function() {};


/**
 * @param {Cesium.CentralBody} centralBody
 */
Cesium.CompositePrimitive.prototype.setCentralBody = function(centralBody) {};


/**
 * @param {!Cesium.Polygon|!Cesium.PolylineCollection|!Cesium.BillboardCollection|!Cesium.CompositePrimitive} poly .
 */
Cesium.CompositePrimitive.prototype.add = function(poly) {};


/**
 * @param {!Cesium.Polygon|!Cesium.PolylineCollection|!Cesium.BillboardCollection|!Cesium.CompositePrimitive} poly .
 */
Cesium.CompositePrimitive.prototype.remove = function(poly) {};



/**
 * @constructor
 */
Cesium.Context = function() {};


/**
 * @return {!Cesium.TextureAtlas}
 */
Cesium.Context.prototype.createTextureAtlas = function() {};



/**
 * @constructor
 * @param {string} proxy
 */
Cesium.DefaultProxy = function(proxy) {};



/**
 * @constructor
 */
Cesium.Event = function() {};



/**
 * @constructor
 */
Cesium.GeographicTilingScheme = function() {};


/**
 * @return {Cesium.Extent}
 */
Cesium.GeographicTilingScheme.prototype.getExtent = function() {};



/**
 * @constructor
 * @param {Cesium.ImageryProvider} imageryProvider
 */
Cesium.ImageryLayer = function(imageryProvider) {};

/**
 * @return {Cesium.ImageryProvider} provider
 */
Cesium.ImageryLayer.prototype.getImageryProvider = function() {};


/**
 * @param {string} url .
 * @return {Object} .
 */
Cesium.ImageryLayer.prototype.loadImage = function(url) {};



/**
 * @constructor
 */
Cesium.ImageryLayerCollection = function() {};


/**
 * @param {Cesium.ImageryProvider} provider
 */
Cesium.ImageryLayerCollection.prototype.addImageryProvider = function(provider) {};


/**
 * @return {number} length
 */
Cesium.ImageryLayerCollection.prototype.getLength = function() {};


/**
 * @param {number} index 
 * @return {Cesium.ImageryLayer} layer
 */
Cesium.ImageryLayerCollection.prototype.get = function(index) {};


/**
 * @param {Cesium.ImageryLayer} layer
 * @param {number=} opt_index 
 */
Cesium.ImageryLayerCollection.prototype.add = function(layer, opt_index) {};


/**
 * @param {Cesium.ImageryLayer} layer
 * @param {boolean} destroy
 */
Cesium.ImageryLayerCollection.prototype.remove = function(layer, destroy) {};



/**
 * @constructor
 */
Cesium.ImageryProvider = function() {};


/**
 * @return {boolean}
 */
Cesium.ImageryProvider.prototype.isReady = function() {};


/**
 * @return {Cesium.Extent}
 */
Cesium.ImageryProvider.prototype.getExtent = function() {};


/**
 * @return {number}
 */
Cesium.ImageryProvider.prototype.getTileWidth = function() {};


/**
 * @return {number}
 */
Cesium.ImageryProvider.prototype.getTileHeight = function() {};


/**
 * @return {number}
 */
Cesium.ImageryProvider.prototype.getMaximumLevel = function() {};


/**
 *  //@return {TilingScheme} The tiling scheme.
 *  // TODO
 *  //@return {Cesium.GeographicTilingScheme}
 *  @return {Cesium.WebMercatorTilingScheme}
 */
Cesium.ImageryProvider.prototype.getTilingScheme = function() {};


/**
 * //@returns {TileDiscardPolicy} The discard policy.
 * // TODO
 * @return {undefined}
 */
Cesium.ImageryProvider.prototype.getTileDiscardPolicy = function() {};


/**
 * @return {Cesium.Event} The event.
 */
Cesium.ImageryProvider.prototype.getErrorEvent = function() {};


/**
 * @return {HTMLImageElement|HTMLCanvasElement|undefined} A canvas or image containing the log to display, or undefined if there is no logo.
 */
Cesium.ImageryProvider.prototype.getLogo = function() {};


/**
 * @param {number} x The tile X coordinate.
 * @param {number} y The tile Y coordinate.
 * @param {number} level The tile level.
 * @return {Object|undefined} 
 */
Cesium.ImageryProvider.prototype.requestImage = function(x, y, level) {};


/**
 * @param {string} url
 * @return {Object}
 */
Cesium.ImageryProvider.loadImage = function(url) {};


/**
 * @constructor
 * @extends {Cesium.ImageryProvider}
 */
Cesium.BingMapsImageryProvider = function(options) {};


/**
 * @constructor
 * @param {Cesium.Cartesian3} radii
 */
Cesium.Ellipsoid = function(radii) {};


/**
 * @type {Cesium.Ellipsoid}
 */
Cesium.Ellipsoid.WGS84;


/**
 * @param {Cesium.Cartographic} cartographic
 * @param {Cesium.Cartesian3=} opt_result
 * @return {!Cesium.Cartesian3}
 */
Cesium.Ellipsoid.prototype.cartographicToCartesian = function(cartographic, opt_result) {};


/**
 * @param {!Array.<Cesium.Cartographic>} cartographic
 * @param {!Array.<Cesium.Cartesian3>=} opt_result
 * @return {!Array.<Cesium.Cartesian3>}
 */
Cesium.Ellipsoid.prototype.cartographicArrayToCartesianArray = function(cartographic, opt_result) {};


/**
 * @param {Cesium.Cartesian3} cartesian
 * @param {Cesium.Cartographic=} opt_result
 * @return {Cesium.Cartographic}
 */
Cesium.Ellipsoid.prototype.cartesianToCartographic = function(cartesian, opt_result) {};


/**
 * @param {!Cesium.Cartesian3} position .
 * @param {Cesium.Cartesian3=} opt_result .
 * @return {!Cesium.Cartesian3}
 */
Cesium.Ellipsoid.prototype.transformPositionToScaledSpace = function(position, opt_result) {};

/**
 * @constructor
 * @param {number} west
 * @param {number} south
 * @param {number} east
 * @param {number} north
 */
Cesium.Extent = function(west, south, east, north) {};

/** @type {number} */
Cesium.Extent.prototype.west;

/** @type {number} */
Cesium.Extent.prototype.south;

/** @type {number} */
Cesium.Extent.prototype.east;

/** @type {number} */
Cesium.Extent.prototype.north;


/**
 * @constructor
 */
Cesium.FeatureDetection = function() {};


/**
 * @return {boolean}
 */
Cesium.FeatureDetection.supportsCrossOriginImagery = function() {};



/**
 * @constructor
 */
Cesium.Math = function() {};


/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
Cesium.Math.clamp = function(value, min, max) {};


/**
 * @type {number}
 */
Cesium.Math.PI_OVER_TWO;


/**
 * @type {number}
 */
Cesium.Math.TWO_PI;



/**
 * @constructor
 */
Cesium.Matrix3 = function() {};


/**
 * @param {Cesium.Quaternion} quaternion
 */
Cesium.Matrix3.fromQuaternion = function(quaternion) {};


/**
 * @param {Cesium.Matrix3} matrix
 * @param {Cesium.Cartesian3} cartesian
 * @param {Cesium.Cartesian3} result
 * @return {Cesium.Cartesian3}
 */
Cesium.Matrix3.multiplyByVector = function(matrix, cartesian, result) {};



/**
 * @constructor
 * @param {number=} opt_a00 .
 * @param {number=} opt_a10 .
 * @param {number=} opt_a20 .
 * @param {number=} opt_a30 .
 * @param {number=} opt_a01 .
 * @param {number=} opt_a11 .
 * @param {number=} opt_a21 .
 * @param {number=} opt_a31 .
 * @param {number=} opt_a02 .
 * @param {number=} opt_a12 .
 * @param {number=} opt_a22 .
 * @param {number=} opt_a32 .
 * @param {number=} opt_a03 .
 * @param {number=} opt_a13 .
 * @param {number=} opt_a23 .
 * @param {number=} opt_a33 .
 */
Cesium.Matrix4 = function(opt_a00, opt_a10, opt_a20, opt_a30,
                          opt_a01, opt_a11, opt_a21, opt_a31,
                          opt_a02, opt_a12, opt_a22, opt_a32,
                          opt_a03, opt_a13, opt_a23, opt_a33) {};


/**
 * @param {Cesium.Cartesian3} translation .
 * @param {Cesium.Matrix4=} opt_result .
 * @return {Cesium.Matrix4} .
 */
Cesium.Matrix4.fromTranslation = function(translation, opt_result) {};


/**
 * @param {Cesium.Matrix4} matrix .
 * @param {Cesium.Matrix4=} opt_result .
 * @return {Cesium.Matrix4} .
 */
Cesium.Matrix4.prototype.multiply = function(matrix, opt_result) {};


/**
 * @param {Cesium.Cartesian3} point .
 * @param {Cesium.Cartesian4=} opt_result .
 * @return {Cesium.Cartesian4} .
 */
Cesium.Matrix4.prototype.multiplyByPoint = function(point, opt_result) {};


/**
 * @param {Cesium.Cartesian4} point .
 * @param {Cesium.Cartesian4=} opt_result .
 * @return {Cesium.Cartesian4} .
 */
Cesium.Matrix4.prototype.multiplyByVector = function(point, opt_result) {};


/**
 * @return {Array.<number>} .
 */
Cesium.Matrix4.prototype.toArray = function() {};



/**
 * @constructor
 * @param {number=} opt_r .
 * @param {number=} opt_g .
 * @param {number=} opt_b .
 * @param {number=} opt_a .
 */
Cesium.Color = function(opt_r, opt_g, opt_b, opt_a) {};



/**
 * @constructor
 * @param {Object} options
 * @extends {Cesium.ImageryProvider}
 */
Cesium.OpenStreetMapImageryProvider = function(options) {};



/**
 * @constructor
 * @param {Object} options
 * @extends {Cesium.ImageryProvider}
 */
Cesium.WebMapServiceImageryProvider = function(options) {};



/**
 * @constructor
 */
Cesium.PerspectiveFrustrum = function() {};


/**
 * @type {number}
 */
Cesium.PerspectiveFrustrum.prototype.aspectRatio;


/**
 * @type {number}
 */
Cesium.PerspectiveFrustrum.prototype.far;


/**
 * @type {number}
 */
Cesium.PerspectiveFrustrum.prototype.fovy;


/**
 * @type {number}
 */
Cesium.PerspectiveFrustrum.prototype.near;


/**
 * @return {!Cesium.Matrix4}
 */
Cesium.PerspectiveFrustrum.prototype.getProjectionMatrix = function() {};



/**
 * @constructor
 */
Cesium.Quaternion = function() {};


/**
 * @param {Cesium.Cartesian3} axis
 * @param {number} angle
 */
Cesium.Quaternion.fromAxisAngle = function(axis, angle) {};



/**
 * @constructor
 * @param {HTMLCanvasElement|Element} canvas
 */
Cesium.Scene = function(canvas) {};


/**
 * @return {!Cesium.Camera}
 */
Cesium.Scene.prototype.getCamera = function() {};


/**
 * @return {HTMLCanvasElement}
 */
Cesium.Scene.prototype.getCanvas = function() {};


/**
 * @return {Cesium.Context}
 */
Cesium.Scene.prototype.getContext = function() {};


/**
 * @return {Cesium.CompositePrimitive}
 */
Cesium.Scene.prototype.getPrimitives = function() {};


/**
 * @return {Cesium.ScreenSpaceCameraController}
 */
Cesium.Scene.prototype.getScreenSpaceCameraController = function() {};


/**
 * @return {!Cesium.UniformState}
 */
Cesium.Scene.prototype.getUniformState = function() {};


/**
 */
Cesium.Scene.prototype.initializeFrame = function() {};


/**
 */
Cesium.Scene.prototype.render = function() {};


/**
 */
Cesium.Scene.prototype.destroy = function() {};


/**
 * @type {Cesium.SceneMode}
 */
Cesium.Scene.prototype.mode;


/**
 * @type {Object}
 */
Cesium.Scene.prototype.scene2D;


/**
 * @type {Cesium.SkyBox}
 */
Cesium.Scene.prototype.skyBox;


/**
 * @type {Cesium.SkyAtmosphere}
 */
Cesium.Scene.prototype.skyAtmosphere;



/**
 * @constructor
 */
Cesium.SceneMode = function() {};


/**
 * @type {Cesium.SceneMode}
 */
Cesium.SceneMode.COLOMBUS_VIEW;


/**
 * @type {Cesium.SceneMode}
 */
Cesium.SceneMode.MORPHING;


/**
 * @type {Cesium.SceneMode}
 */
Cesium.SceneMode.SCENE2D;


/**
 * @type {Cesium.SceneMode}
 */
Cesium.SceneMode.SCENE3D;



/**
 * @constructor
 */
Cesium.UniformState = function() {};


/**
 * @return {!Cesium.Matrix4}
 */
Cesium.UniformState.prototype.getModelViewProjection = function() {};



/**
 * @constructor
 */
Cesium.ScreenSpaceCameraController = function() {};


/**
 * @type {boolean}
 */
Cesium.ScreenSpaceCameraController.prototype.enableRotate;

/**
 * @type {boolean}
 */
Cesium.ScreenSpaceCameraController.prototype.enableLook;

/**
 * @type {boolean}
 */
Cesium.ScreenSpaceCameraController.prototype.enableTilt;



/**
 * @constructor
 * @param {!Element} canvas .
 */
Cesium.ScreenSpaceEventHandler = function(canvas) {};


/**
 * @param {Function} callback .
 * @param {Cesium.ScreenSpaceEventType} type .
 */
Cesium.ScreenSpaceEventHandler.prototype.setInputAction = function(callback, type) {};


/** @constructor */
Cesium.ScreenSpaceEventType = function() {};

/** @type {Cesium.ScreenSpaceEventType} */
Cesium.ScreenSpaceEventType.LEFT_DOWN;

/** @type {Cesium.ScreenSpaceEventType} */
Cesium.ScreenSpaceEventType.RIGHT_DOWN;

/** @type {Cesium.ScreenSpaceEventType} */
Cesium.ScreenSpaceEventType.MIDDLE_DOWN;

/** @type {Cesium.ScreenSpaceEventType} */
Cesium.ScreenSpaceEventType.WHEEL;

/** @type {Cesium.ScreenSpaceEventType} */
Cesium.ScreenSpaceEventType.PINCH_START;



/**
 * @constructor
 * @extends {Cesium.ImageryProvider}
 * @param {Cesium.SingleTileImageryProviderOptions} options
 */
Cesium.SingleTileImageryProvider = function(options) {};


/**
 * @typedef {{url: string}}
 */
Cesium.SingleTileImageryProviderOptions;



/**
 * @constructor
 * @extends {Cesium.ImageryProvider}
 * @param {Object} options
 */
Cesium.TileMapServiceImageryProvider = function(options) {};



/**
 * @constructor
 */
Cesium.SkyAtmosphere = function() {};


/**
 * @constructor
 * @param {{positiveX: string, negativeX: string,
 *          positiveY: string, negativeY: string,
 *          positiveZ: string, negativeZ: string}} options
 */
Cesium.SkyBox = function(options) {};



/**
 * @interface
 * HACK This type definition prevents positiveX and friends
 * to be renamed when passing options to Cesium.SkyBox. There
 * must be a better way to do this!
 */
Cesium.SkyBoxOptions_ = function() {};


/**
 * @type {string}
 */
Cesium.SkyBoxOptions_.prototype.positiveX;


/**
 * @type {string}
 */
Cesium.SkyBoxOptions_.prototype.negativeX;


/**
 * @type {string}
 */
Cesium.SkyBoxOptions_.prototype.positiveY;


/**
 * @type {string}
 */
Cesium.SkyBoxOptions_.prototype.negativeY;


/**
 * @type {string}
 */
Cesium.SkyBoxOptions_.prototype.positiveZ;


/**
 * @type {string}
 */
Cesium.SkyBoxOptions_.prototype.negativeZ;



/**
 * @constructor
 * @param {Cesium.Ellipsoid} ellipsoid
 */
Cesium.WebMercatorProjection = function(ellipsoid) {};


/**
 * @param {Cesium.Cartographic} cartographic
 * @return {Cesium.Cartesian3}
 */
Cesium.WebMercatorProjection.prototype.project = function(cartographic) {};


/**
 * @param {Cesium.Cartesian3} cartesian
 * @return {Cesium.Cartographic}
 */
Cesium.WebMercatorProjection.prototype.unproject = function(cartesian) {};



/**
 * @constructor
 */
Cesium.WebMercatorTilingScheme = function() {};


/**
 * @return {Cesium.Extent}
 */
Cesium.WebMercatorTilingScheme.prototype.getExtent = function() {};


/** @constructor */
Cesium.BingMapsStyle = function() {};

/** @type {!Cesium.BingMapsStyle} */
Cesium.BingMapsStyle.AERIAL;

/** @type {!Cesium.BingMapsStyle} */
Cesium.BingMapsStyle.AERIAL_WITH_LABELS;

/** @type {!Cesium.BingMapsStyle} */
Cesium.BingMapsStyle.ROAD;