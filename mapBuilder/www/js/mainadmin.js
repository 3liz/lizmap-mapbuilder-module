
import 'ol/ol.css';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Feature from 'ol/Feature';
import {getWidth} from 'ol/extent.js';
import {fromExtent} from 'ol/geom/Polygon.js';
import Draw, {createBox} from 'ol/interaction/Draw.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {WMTS, StadiaMaps, BingMaps, OSM, Vector as VectorSource} from 'ol/source.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';

import {Control, defaults as defaultControls} from 'ol/control.js';
import {get as getProjection, transformExtent} from 'ol/proj.js';
import {QueueExtent} from "./modules/QueueExtent";

var mapBuilderAdmin = {};
var map = undefined;

/**
 * Queue of extents
 * @type {QueueExtent}
 */
var extentHistory = undefined;
/**
 * Index of the current extent in the history
 * @type {number}
 */
var indexExtentHystory = 0;
/**
 * Maximum length of the history of extents
 * @type {number}
 */
var MAX_LENGTH_EXTENT_HYSTORY = 15;

$(function() {

  //Build the history of extents
  var extent = document.getElementById("jforms_mapBuilderAdmin_config_extent").value.split(',').map(parseFloat);

  extentHistory = new QueueExtent({
    element: transformExtent(extent, 'EPSG:4326', 'EPSG:3857'),
    length: MAX_LENGTH_EXTENT_HYSTORY
  });

  refreshLayerMap();

  // Set extent input as readonly
  $('#jforms_mapBuilderAdmin_config_extent').prop('readonly', true);

  // Filter default baselayer choices based on selected baselayers
  // Init
  $('#jforms_mapBuilderAdmin_config_baseLayerDefault option').hide();

  $('.jforms-ctl-baseLayer input:checked').each(function() {
    $('#jforms_mapBuilderAdmin_config_baseLayerDefault option[value='+$(this).val()+']').show();
  });

  // Toggle on change
  $('.jforms-ctl-baseLayer input').change(function() {
    $('#jforms_mapBuilderAdmin_config_baseLayerDefault option[value='+$(this).val()+']').toggle($(this).is(':checked'));
  });

  //Refresh the map when the default baselayer is changed
  document.getElementById("jforms_mapBuilderAdmin_config_baseLayerDefault").addEventListener("change", () => {
    refreshLayerMap();
  })

  //Refresh the map when the Bing key is changed and add a timeout to prevent too many requests
  var idTimeout = undefined;
  document.getElementById("jforms_mapBuilderAdmin_config_baseLayerKeyBing").addEventListener("input", () => {
    if (document.getElementById("jforms_mapBuilderAdmin_config_baseLayerDefault").value.includes("bing")) {
      clearTimeout(idTimeout);
      idTimeout = setTimeout(() => {
        refreshLayerMap();
      }, 1000);
    }
  });

  // Make OL map object accessible to help debugging
  if (!PRODUCTION) {
    $("#map").data('map', map);
  }

  /**
   * Refresh the map with the new configuration of the base layer
   */
  async function refreshLayerMap() {
    var baseLayerDefault = document.getElementById("jforms_mapBuilderAdmin_config_baseLayerDefault").value;

    var raster = undefined;

    //Generate the new base layer
    if (baseLayerDefault === 'osmMapnik') {
      raster = new TileLayer({
        source: new OSM()
      });
    } else if (baseLayerDefault === 'osmStadiaMapsToner') {
      raster = new TileLayer({
        source: new StadiaMaps({
          layer: 'stamen_toner_lite'
        })
      });
    } else if (baseLayerDefault.includes("bing")) {
      var imagerySet = undefined;

      if (baseLayerDefault.includes("Streets")) {
        imagerySet = "Road";
      } else if (baseLayerDefault.includes("Satellite")) {
        imagerySet = "Aerial";
      } else {
        imagerySet = "AerialWithLabels";
      }

      raster = new TileLayer({
        visible: true,
        preload: Infinity,
        source: new BingMaps({
          key: document.getElementById("jforms_mapBuilderAdmin_config_baseLayerKeyBing").value,
          imagerySet: imagerySet
        })
      });
    } else if (baseLayerDefault.includes("ign")) {
      var imagerySet = undefined;
      var ignImageFormat = undefined;
      var ignZoomLevel = undefined;

      if (baseLayerDefault.includes("Streets")) {
        imagerySet = "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2";
        ignImageFormat = "image/png";
        ignZoomLevel = 20;
      } else if (baseLayerDefault.includes("Satellite")) {
        imagerySet = "ORTHOIMAGERY.ORTHOPHOTOS";
        ignImageFormat = "image/jpeg";
        ignZoomLevel = 22;
      } else {
        imagerySet = "CADASTRALPARCELS.PARCELLAIRE_EXPRESS";
        ignImageFormat = "image/png";
        ignZoomLevel = 20;
      }

      var resolutions = [];
      var matrixIds = [];
      var proj3857 = getProjection('EPSG:3857');
      var maxResolution = getWidth(proj3857.getExtent()) / 256;

      for (var i = 0; i < ignZoomLevel; i++) {
        matrixIds[i] = i.toString();
        resolutions[i] = maxResolution / Math.pow(2, i);
      }

      var tileGrid = new WMTSTileGrid({
        origin: [-20037508, 20037508],
        resolutions: resolutions,
        matrixIds: matrixIds
      });

      var ign_source = new WMTS({
        url: "https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile",
        layer: imagerySet,
        matrixSet: 'PM',
        format: ignImageFormat,
        projection: 'EPSG:3857',
        tileGrid: tileGrid,
        style: 'normal',
        attributions: `<a href="https://www.ign.fr/" target="_blank">
          <img src="https://wxs.ign.fr/static/logos/IGN/IGN.gif" 
          title="Institut national de l'information géographique et forestière" alt="IGN"></a>`
      });

      raster = new TileLayer({
        source: ign_source
      });

    } else {
      raster = new TileLayer({
        source: new OSM()
      });
    }

    var source = new VectorSource({wrapX: false});

    var vector = new VectorLayer({
      source: source
    });

    var mapElement = document.getElementById("map");

    if (mapElement.childElementCount !== 0) {
      document.getElementById("map").children[0].remove();
    }

    /**
     * Class representing a button to zoom to the origin of the map.
     * @extends Control
     */
    var zoomToOriginControl = class ZoomToOriginControl extends Control {

      constructor(opt_options) {

        var options = opt_options || {};

        var button = document.createElement('button');
        button.className = 'fas fa-expand-arrows-alt';
        button.title = 'Zoom to selected map extent';

        var element = document.createElement('div');
        element.className = 'ol-zoom-origin ol-unselectable ol-control';
        element.appendChild(button);

        super({
          element: element,
          target: options.target,
        });

        button.addEventListener('click', this.handleZoomToOrigin.bind(this), false);
      }

      /**
       * Handle click event to adjust the view;
       */
      handleZoomToOrigin() {
        var extent = document.getElementById("jforms_mapBuilderAdmin_config_extent").value.split(',').map(parseFloat);

        extent = transformExtent(extent, 'EPSG:4326', 'EPSG:3857');

        this.getMap().getView().fit(extent, {
          duration: 250
        });
      };
    }

    /**
     * Class representing a button to draw an extent on the map.
     * @extends Control
     */
    var selectExtentControl = class selectExtentControl extends Control {
      /**
       * @type {Draw}
       */
      draw;
      /**
       * @type {boolean}
       */
      isActive;
      /**
       * @type {HTMLButtonElement}
       */
      button;

      constructor(opt_options) {

        var options = opt_options || {};

        var button = document.createElement('button');
        button.className = 'fas fa-pen-square';
        button.title = 'Once clicked, select the extent you wish on the map';

        var element = document.createElement('div');
        element.className = 'ol-select-extent ol-unselectable ol-control';
        element.appendChild(button);

        super({
          element: element,
          target: options.target,
        });

        this.button = button;

        this.isActive = false;

        this.draw = new Draw({
          source: source,
          type: 'Circle',
          geometryFunction: createBox()
        });

        //Clear the source when the user starts to draw a new extent
        this.draw.on('drawstart', function (e) {
          source.clear();

          //Disable buttons to prevent bugs from user
          button.disabled = true;
          button.id = "controlButtonDisabled";
          var undoElement = document.querySelector(".ol-do-control-undo")
          undoElement.id = "controlButtonDisabled";
          undoElement.disabled = true;
          var redoElement = document.querySelector(".ol-do-control-redo")
          redoElement.id = "controlButtonDisabled";
          redoElement.disabled = true;
        });

        //Set the extent in the input field when the user finishes to draw an extent
        this.draw.on('drawend', function (e) {
          var tmpExtent = e.feature.getGeometry().getExtent();
          $('#jforms_mapBuilderAdmin_config_extent').val(transformExtent(tmpExtent, 'EPSG:3857', 'EPSG:4326'));

          //Enable button
          button.disabled = false;
          button.id = "";

          extentHistory.deleteAllAfter(indexExtentHystory);

          if (indexExtentHystory < 14) {
            indexExtentHystory++;
          }
          extentHistory.addElement(tmpExtent);

          var undoElement = document.querySelector(".ol-do-control-undo")
          undoElement.id = "";
          undoElement.disabled = false;
        });

        button.addEventListener('click', this.handleSelectExtent.bind(this), false);
      }

      //Handle the click event on the button
      handleSelectExtent() {
        if (this.isActive) {
          map.removeInteraction(this.draw);
          this.isActive = false;
          document.querySelector(".fas.fa-pen-square").style.backgroundColor = '';
        } else {
          map.addInteraction(this.draw);
          this.isActive = true;
          document.querySelector(".fas.fa-pen-square").style.backgroundColor = '#FFCDCD';
        }
      }
    }

    /**
     * Class representing a control to undo and redo the extent drawn on the map.
     * @extends Control
     */
    var undoRedoControl = class undoRedoControl extends Control {
      constructor(options) {
        options = options ? options : {};

        super({
          element: document.createElement('div'),
          target: options.target,
        });

        const className = 'ol-do-control';

        //Create the undo button
        const undoElement = document.createElement('button');
        undoElement.className = className + '-undo fas fa-undo-alt';
        undoElement.setAttribute('type', 'button');
        undoElement.title = 'Undo';

        undoElement.addEventListener('click', this.undo.bind(this), false);

        //Create the redo button
        const redoElement = document.createElement('button');
        redoElement.className = className + '-redo fas fa-redo-alt';
        redoElement.setAttribute('type', 'button');
        redoElement.title = 'Redo';

        redoElement.addEventListener('click', this.redo.bind(this), false);

        const cssClasses =
            className + ' ol-unselectable ol-control';
        const element = this.element;
        element.className = cssClasses;
        element.appendChild(undoElement);
        element.appendChild(redoElement);

        this.undoEl = undoElement;
        this.redoEl = redoElement;

        if (indexExtentHystory === 0) {
          undoElement.id = "controlButtonDisabled";
          undoElement.disabled = true;
        }

        redoElement.id = "controlButtonDisabled";
        redoElement.disabled = true;

      }

      /**
       * Undo the last extent drawn on the map.
       */
      undo() {
        source.clear();
        indexExtentHystory--;
        var extent = extentHistory.getElementAt(indexExtentHystory);
        document.getElementById("jforms_mapBuilderAdmin_config_extent").value = transformExtent(extent, map.getView().getProjection(), 'EPSG:4326');

        source.addFeature(
            new Feature({
              geometry: fromExtent(extent)
            })
        );

        if (indexExtentHystory <= 0) {
          this.undoEl.id = "controlButtonDisabled";
          this.undoEl.disabled = true;
        }
        this.redoEl.id = "";
        this.redoEl.disabled = false;
      }

      /**
       * Redo the last extent drawn on the map.
       */
      redo() {
        source.clear();
        indexExtentHystory++;
        var extent = extentHistory.getElementAt(indexExtentHystory);
        document.getElementById("jforms_mapBuilderAdmin_config_extent").value = transformExtent(extent, map.getView().getProjection(), 'EPSG:4326');

        source.addFeature(
            new Feature({
              geometry: fromExtent(extent)
            })
        );

        if (indexExtentHystory >= extentHistory.getLength() - 1) {
          this.redoEl.id = "controlButtonDisabled";
          this.redoEl.disabled = true;
        }
        this.undoEl.id = "";
        this.undoEl.disabled = false;
      }
    }

    //Create the map
    map = new Map({
      layers: [raster, vector],
      target: 'map',
      controls: defaultControls().extend([
        new zoomToOriginControl(),
        new selectExtentControl(),
        new undoRedoControl()
      ]),
      view: new View({
        extent: transformExtent([-180, -85.06, 180, 85.06], 'EPSG:4326', 'EPSG:3857'),
        center: [95022, 5922170],
        zoom: 5
      })
    });

    // Display original extent on map if set
    var extentString = $('#jforms_mapBuilderAdmin_config_extent').val();

    if (extentString !== "") {
      var extent = transformExtent(extentString.split(',').map(parseFloat), 'EPSG:4326', map.getView().getProjection())
      source.addFeature(
          new Feature({
            geometry: fromExtent(extent)
          })
      );
      map.getView().fit(extent);
    }

  }
});
