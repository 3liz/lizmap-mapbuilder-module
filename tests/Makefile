SHELL = bash
.ONESHELL:
.PHONY: env
#

LIZMAP_DIR=$(shell pwd)/lizmap

LIZMAP_USER_ID:=$(shell id -u)
LIZMAP_USER_GID:=$(shell id -g)

LIZMAP_VERSION_TAG:=3.6
QGIS_VERSION_TAG:=3.22
POSTGIS_VERSION_TAG:=13-3

QGIS_MAP_WORKERS:=1

LIZMAP_PORT:=127.0.0.1:9016
OWS_PORT:=127.0.0.1:9017
LZMPGPORT:=127.0.0.1:9018

BASEDIR:=$(shell realpath ..)

MODULE_SRC:=$(shell realpath ..)

main:
	@cat <<- EOF
		Commandes:
			run:   initialise environnement and run stack
			stop:  stop docker and remove containers
			clean: reset containers and remove lizmap configuration

			Note: Un fichier d'environment pour docker compose
			est crée à chaque invocation de 'run'.
			Cela permet d'utiliser les commandes 'docker compose'
			sans passer par le Makefile
	EOF

dirs:
	@mkdir -p $(LIZMAP_DIR)/var/log/nginx \
		      $(LIZMAP_DIR)/var/nginx-cache \
		      $(LIZMAP_DIR)/qgis-server-plugins \
		      $*

env: dirs
	@cat <<- EOF > .env
		COMPOSE_PROJECT_NAME=mapbuilder
		LIZMAP_DIR=$(LIZMAP_DIR)
		LIZMAP_USER_ID=$(LIZMAP_USER_ID)
		LIZMAP_USER_GID=$(LIZMAP_USER_GID)
		QGIS_MAP_WORKERS=$(QGIS_MAP_WORKERS)
		LIZMAP_PORT=$(LIZMAP_PORT)
		OWS_PORT=$(OWS_PORT)
		LZMPGPORT=$(LZMPGPORT)
		MODULE_SRC=$(MODULE_SRC)
		LIZMAP_VERSION_TAG=$(LIZMAP_VERSION_TAG)
		QGIS_VERSION_TAG=$(QGIS_VERSION_TAG)
		POSTGIS_VERSION_TAG=$(POSTGIS_VERSION_TAG)
		EOF

run: stop env install-plugins
	docker compose up

stop:
	docker compose down || true

clean: stop
	docker compose down -v
	rm -rf $(LIZMAP_DIR)/www/*
	rm -rf $(LIZMAP_DIR)/var/*

# Pull images from github 3liz
pull:
	docker pull 3liz/lizmap-web-client:${LIZMAP_VERSION_TAG}
	docker pull 3liz/qgis-map-server:${QGIS_VERSION_TAG}
	docker pull 3liz/postgis:${POSTGIS_VERSION_TAG}

shell:
	docker compose exec -u ${LIZMAP_USER_ID} lizmap /bin/sh -l

install-module:
	docker compose exec -u ${LIZMAP_USER_ID} lizmap php /www/lizmap/install/configurator.php mapBuilder
	docker compose exec -u ${LIZMAP_USER_ID} lizmap php /www/lizmap/install/configurator.php mapBuilderAdmin
	docker compose exec -u ${LIZMAP_USER_ID} lizmap php /www/lizmap/install/installer.php -v --no-clean-temp
	docker compose exec  lizmap /www/lizmap/install/clean_vartmp.sh

install-plugins:
	docker run \
	    -u $(LIZMAP_USER_ID):$(LIZMAP_USER_GID) \
	    --rm -it \
	    -e QGSRV_SERVER_PLUGINPATH=/srv/plugins \
	    -v $(LIZMAP_DIR)/qgis-server-plugins:/srv/plugins \
	    -v $(shell pwd)/:/src \
	    --entrypoint /src/add-server-plugins.sh \
	    3liz/qgis-map-server:${QGIS_VERSION_TAG}
