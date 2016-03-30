NODE_VERSION=4.4.0
.PHONY: help install npm clean test coverage lint docker-build docker-run-debug docker-run-prod docker-stop-prod run-prod run-debug docker-chown

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## install depedencies thanks to a local npm install
	@npm install

run-debug: ## run bibliomap in debug mode (with local nodejs and without docker)
	@DEBUG=* NODE_ENV=development npm start

run-dev: ## run bibliomap in dev mode (with nodejs/nodemon and without docker)
	@DEBUG=* NODE_ENV=development ./node_modules/.bin/nodemon ./app.js

run-prod: ## run bibliomap in production mode (with local mongo and nodejs and without docker)
	@NODE_ENV=production npm start

docker-install: ## install depedencies thanks to a dockerized npm install
	@docker run -it --rm -v $$(pwd):/app -w /app --net=host -e NODE_ENV -e http_proxy -e https_proxy node:${NODE_VERSION} npm install
	@make docker-chown

docker-build: ## build the docker ezpaarseproject/bibliomap image localy
	@docker build -t ezpaarseproject/bibliomap --build-arg http_proxy --build-arg https_proxy .

docker-run-prod: ## run bibliomap in production mode with the full dockerized image (see docker-build)
	@NODE_ENV=production docker-compose -f ./docker-compose.yml up -d --force-recreate

docker-stop-prod: ## stop bibliomap production daemon
	@NODE_ENV=production docker-compose -f ./docker-compose.yml stop

# makefile rule used to keep current user's unix rights on the docker mounted files
docker-chown:
	@test ! -d $$(pwd)/node_modules || docker run -it --rm --net=host -v $$(pwd):/app node:${NODE_VERSION} chown -R $$(id -u):$$(id -g) /app/

## npm wrapper. example: make npm install --save mongodb-querystring
npm:
	@docker run -it --rm -v $$(pwd):/app -w /app --net=host -e NODE_ENV -e http_proxy -e https_proxy node:${NODE_VERSION} npm $(filter-out $@,$(MAKECMDGOALS))
	@make docker-chown

test: ## run bibliomap unit tests
	@npm test

clean: ## remove node_modules and temp files
	@rm -Rf ./node_modules/ ./npm-debug.log

