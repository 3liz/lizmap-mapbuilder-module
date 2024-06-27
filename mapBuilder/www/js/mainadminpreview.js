import 'ol/ol.css';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Feature from 'ol/Feature';
import {getWidth} from 'ol/extent.js';
import {fromExtent} from 'ol/geom/Polygon.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {WMTS, StadiaMaps, BingMaps, OSM, Vector as VectorSource} from 'ol/source.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';

import {get as getProjection, transformExtent} from 'ol/proj.js';
import {defaults as defaultControls} from 'ol/control.js';

import {ZoomToOriginControl} from "./components/AdminControls/ZoomToOriginControl";

$(function () {

    var baseLayerDefault = document.getElementById("_baseLayerDefault").textContent;

    var raster = undefined;

    //Generate the base layer
    if (baseLayerDefault === 'OSM Mapnik') {
        raster = new TileLayer({
            source: new OSM()
        });
    } else if (baseLayerDefault === 'OSM StadiaMaps Toner') {
        raster = new TileLayer({
            source: new StadiaMaps({
                layer: 'stamen_toner_lite'
            })
        });
    } else if (baseLayerDefault.includes("Bing")) {
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
                key: document.getElementById("_baseLayerKeyBing").textContent,
                imagerySet: imagerySet
            })
        });
    } else if (baseLayerDefault.includes("IGN")) {
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

    //Create the map
    var map = new Map({
        layers: [raster, vector],
        target: 'map',
        controls: defaultControls().extend([
            new ZoomToOriginControl({
                isPreview: true
            })
        ]),
        view: new View({
            extent: transformExtent([-180, -85.06, 180, 85.06], 'EPSG:4326', 'EPSG:3857'),
            center: [95022, 5922170],
            zoom: 5
        })
    });

    var extentString = document.getElementById("_extent").textContent;

    if (extentString !== "") {
        var extent = transformExtent(extentString.split(',').map(parseFloat), 'EPSG:4326', map.getView().getProjection())
        source.addFeature(
            new Feature({
                geometry: fromExtent(extent)
            })
        );
        map.getView().fit(extent);
    }

    // Make OL map object accessible to help debugging
    if (!PRODUCTION) {
        $("#map").data('map', map);
    }
});