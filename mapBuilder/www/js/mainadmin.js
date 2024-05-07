
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

import {get as getProjection, transformExtent} from 'ol/proj.js';

var mapBuilderAdmin = {};
var map = undefined;
$(function() {

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

  document.getElementById("jforms_mapBuilderAdmin_config_baseLayerDefault").addEventListener("change", () => {
    refreshLayerMap();
  })

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

  async function refreshLayerMap() {
    var baseLayerDefault = document.getElementById("jforms_mapBuilderAdmin_config_baseLayerDefault").value;

    var raster = undefined;

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

    map = new Map({
      layers: [raster, vector],
      target: 'map',
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

    var draw = new Draw({
      source: source,
      type: 'Circle',
      geometryFunction: createBox()
    });

    draw.on('drawstart', function (e) {
      source.clear();
    });

    draw.on('drawend', function (e) {
      $('#jforms_mapBuilderAdmin_config_extent').val(transformExtent(e.feature.getGeometry().getExtent(), 'EPSG:3857', 'EPSG:4326'));
    });

    map.addInteraction(draw);
  }
});
