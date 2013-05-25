PLOVR=../plovr-eba786b34df9.jar

.PHONY: cesium

serve:
	java -jar $(PLOVR) serve -p 9810 api.json api-debug.json
build:
	java -jar $(PLOVR) build api.json > deploy/api.js
lint:
	fixjsstyle --strict -r ./src
	gjslint --strict -r ./src
soyweb:
	java -jar $(PLOVR) soyweb -p 9820 --dir .
cesium:
	cd cesium && "./Tools/apache-ant-1.8.2/bin/ant" minify