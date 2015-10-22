PLOVR_VERSION=2.0.0
PLOVR=plovr-$(PLOVR_VERSION).jar

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
	java -jar $(PLOVR) build app.json > deploy/index_nocesium.js
lint:
	fixjsstyle --strict -r ./src
	fixjsstyle --strict -r ./src-app
	gjslint --strict -r ./src
	gjslint --strict -r ./src-app
webserver:
	java -jar $(PLOVR) soyweb -p 9820 --dir .
cesium:
	git submodule init
	git submodule update
	cd cesium && "./Tools/apache-ant-1.8.2/bin/ant" minify
library:
	git submodule init
	git submodule update
