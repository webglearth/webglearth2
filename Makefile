PLOVR=../plovr-81ed862.jar

.PHONY: cesium

serve:
	java -jar $(PLOVR) serve -p 9810 api.json api-debug.json app.json app-debug.json
build:
	java -jar $(PLOVR) build api.json > deploy/api_nocesium.js
	java -jar $(PLOVR) build app.json > deploy/index_nocesium.js
lint:
	fixjsstyle --strict -r ./src
	fixjsstyle --strict -r ./src-app
	gjslint --strict -r ./src
	gjslint --strict -r ./src-app
soyweb:
	java -jar $(PLOVR) soyweb -p 9820 --dir .
cesium:
	cd cesium && "./Tools/apache-ant-1.8.2/bin/ant" minify