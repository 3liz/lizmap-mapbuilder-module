# Changelog

## Unreleased

### Added

## 2.3.0 - 2025-02-27

### Added

* Filters on which project to show in the `LayerStore` : 
   * Filter by extent
   * Filter by keywords between "Union" & "Intersection
* `ESLint` for JavaScript code quality
* `StyleLint` for CSS code quality
* `PHP CS Fixer` for PHP code quality
* `PHP Stan` for PHP code quality
* `Playwright` for e2e tests
* Some testing projects
* New logo for project layers in the `LayerStore`
* Indicator from which project a selected layer comes from

### Changed

* `LayerStore` structure for projects

### Fixed

* Update the order of layers in the legend dock

## 2.2.1 - 2025-01-20

### Fixed

* Built files in `dist` folder

## 2.2.0 - 2024-09-30

### Added

* Inkmap for printing maps (_not npm_)
* Map preview before configuration
* Dynamic update of the base map layer in the configuration
* Buttons in configuration for the extent (Undo/Redo...)
* Visuals on layer store
* Visuals on layer selected
* Multiple flash messages

### Changed

* OpenLayers updated to 10.2.1
* Attribute table now uses `lit-html`

### Removed

* `jspdf` dependency from `mapBuilder/www/js/dist/`
* `fancytree` dependency

## 2.1.3 - 2024-01-10

### Fixed

* fix latest bug: it was still there 


## 2.1.2 - 2024-01-08

### Fixed

* errors while loading proj4Php for Lizmap > 3.7

## 2.1.1 - 2023-02-27

### Added

* Increase required lizmap max version to 3.7

## 2.1.0 - 2022-12-15

### Added

* The module is now only compatible with Lizmap 3.6 and higher

### Changed

* Update IGN support

## 2.0.3 - 2022-11-16

### Fixed

* Check the existence of the configuration file 

## 2.0.2 - 2021-12-24

### Added

* The module is compatible with Lizmap 3.5
