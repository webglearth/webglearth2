PLOVR=../plovr-eba786b34df9.jar

serve:
	java -jar $(PLOVR) serve -p 9810 api-debug.json
build:
	java -jar $(PLOVR) build api.json > deploy/api.js
lint:
	fixjsstyle --strict -r ./src
	gjslint --strict -r ./src
soyweb:
	java -jar $(PLOVR) soyweb -p 9820 --dir .