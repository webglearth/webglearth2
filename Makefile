PLOVR_VERSION=2.0.0
PLOVR=plovr-$(PLOVR_VERSION).jar

WEBGLEARTH_VERSION = $(firstword $(subst -, ,$(subst v,,$(shell git describe --tags))))

.PHONY: plovr cesium lint webserver

all: build
plovr: $(PLOVR)
$(PLOVR):
	wget -q --no-check-certificate https://registry.npmjs.org/plovr/-/plovr-$(PLOVR_VERSION).tgz
	tar -xOzf plovr-$(PLOVR_VERSION).tgz package/bin/plovr.jar > $(PLOVR)
	rm plovr-$(PLOVR_VERSION).tgz
serve:
	java -jar $(PLOVR) serve -p 9810 *.json
build:
	java -jar $(PLOVR) build api.json > deploy/api_nocesium.js
	sed -e 's#{WEBGLEARTH_VERSION}#$(WEBGLEARTH_VERSION)#' deploy/header.js > deploy/api.js
	cat cesium/Build/Cesium/Cesium.js >> deploy/api.js
	cat deploy/api_nocesium.js >> deploy/api.js
	java -jar $(PLOVR) build app.json > deploy/index_nocesium.js
	sed -e 's#{WEBGLEARTH_VERSION}#$(WEBGLEARTH_VERSION)#' deploy/header.js > deploy/index.js
	cat cesium/Build/Cesium/Cesium.js >> deploy/index.js
	cat deploy/index_nocesium.js >> deploy/index.js
lint:
	fixjsstyle --strict -r ./src
	fixjsstyle --strict -r ./src-app
	gjslint --strict -r ./src
	gjslint --strict -r ./src-app
webserver:
	java -jar $(PLOVR) soyweb -p 9820 --dir .
cesium:
	cd cesium && "./Tools/apache-ant-1.8.2/bin/ant" minify
