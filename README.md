# MapBuilder module

[![Release 🚀](https://github.com/3liz/lizmap-mapbuilder-module/actions/workflows/release.yml/badge.svg)](https://github.com/3liz/lizmap-mapbuilder-module/actions/workflows/release.yml)
[![Packagist](https://img.shields.io/packagist/v/lizmap/lizmap-mapbuilder-module)](https://packagist.org/packages/lizmap/lizmap-mapbuilder-module)

![demo](demo.jpg "3Liz Map Builder")

You can have a look at our [map builder demo](https://demo.lizmap.com/mapbuilder/).
* OSM project
* Local Urbanism Plan project
* Combine these two projects into a single one using the Map Builder

* MapBuilder 2.2.x is compatible with Lizmap Web Client 3.8
* MapBuilder 2.1.x is compatible with Lizmap Web Client 3.6
* MapBuilder 2.0.x is compatible with Lizmap Web Client 3.4, 3.5
* MapBuilder 1.1.x is compatible with Lizmap Web Client 3.3 and 3.2

## Installation

It is recommended to install the module with [Composer](https://getcomposer.org), the package manager for PHP.
If you can't use it, use the manual way to install the module (jump to the corresponding section below)

For MapBuilder 2.0.x and 1.1.x, see the README.md file from their respective packages.

### Automatic installation with Composer and lizmap 3.6 or higher

* into `lizmap/my-packages`, create the file `composer.json` (if it doesn't exist)
  by copying the file `composer.json.dist`, and install the modules with Composer:

```bash
cp -n lizmap/my-packages/composer.json.dist lizmap/my-packages/composer.json
composer require --working-dir=lizmap/my-packages "lizmap/lizmap-mapbuilder-module=2.1.*"
```

* Then go into `lizmap/install/` and execute Lizmap install scripts :

```bash
php configurator.php mapBuilder
php configurator.php mapBuilderAdmin
php installer.php
./clean_vartmp.sh
./set_rights.sh
```

* Go to the administration of Lizmap with your browser to configure mapBuilder

To update modules, run `composer update --working-dir=lizmap/my-packages`,
then execute previous commands from `lizmap/install/`.

### Manual installation into lizmap 3.6 without Composer

* Download the zip archive of a version 2.1 or higher from the [release page into GitHub](https://github.com/3liz/lizmap-mapbuilder-module/releases).
* Extract files from the archive and copy directories `mapBuilder` and `mapBuilderAdmin` into `lizmap/lizmap-modules/` of Lizmap.
* Then execute Lizmap install scripts into `lizmap/install/` :

```bash
php configurator.php mapBuilder
php configurator.php mapBuilderAdmin
php installer.php
./clean_vartmp.sh
./set_rights.sh
```

* Go to the administration of Lizmap with your browser to configure mapBuilder

To update modules, download a new package, and repeat these previous instructions.

### Inkmap dependency

Inkmap is a dependency created by [CampToCamp](https://github.com/camptocamp/inkmap) based on [OpenLayers](https://openlayers.org/).
It's used by lizmapBuilder to print in real time edited map to PDF.
Adding it to lizmapBuilder required to change the operation of the dependency.
In future releases, Inkmap will be added as a dependency in npm, but currently, it is directly put in `mapBuilder/www/js/dist`.
