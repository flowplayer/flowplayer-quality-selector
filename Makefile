BASE=flowplayer.quality-selector
GIT_ID=${shell git rev-parse --short HEAD }

min:
	@ sed -e 's/\$$GIT_ID\$$/$(GIT_ID)/' stylus/$(BASE).styl | npm run styl
	@ sed -e 's/\$$GIT_ID\$$/$(GIT_ID)/' $(BASE).js | npm run min -

dist: min
	@ sed -e 's/\$$GIT_ID\$$/$(GIT_ID)/' $(BASE).js > dist/$(BASE).js

deps:
	@ npm install
