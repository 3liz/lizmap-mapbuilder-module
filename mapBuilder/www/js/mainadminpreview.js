import 'ol/ol.css';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Feature from 'ol/Feature';
import {fromExtent} from 'ol/geom/Polygon.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';

import {transformExtent} from 'ol/proj.js';
import {defaults as defaultControls} from 'ol/control.js';

import {ZoomToOriginControl} from "./components/AdminControls/ZoomToOriginControl";

document.addEventListener("DOMContentLoaded", async function() {

    var baseLayerDefault = document.getElementById("_baseLayerDefault").textContent;

    var raster = undefined;

    let previewDict = {
        "OSM Mapnik": "osmMapnik",
        "OSM StadiaMaps Toner": "osmStadiaMapsToner",
        "Bing Streets": "bingStreets",
        "Bing Satellite": "bingSatellite",
        "Bing Hybrid": "bingHybrid",
        "IGN Streets": "ignStreets",
        "IGN Satellite": "ignSatellite",
        "IGN Cadastral": "ignCadastral"
    };

    baseLayerDefault = previewDict[baseLayerDefault];
    baseLayerDefault = baseLayerDefault === undefined ? "emptyBaselayer" : baseLayerDefault;

    //Generate base layer
    if (baseLayerDefault === "emptyBaselayer") {
        raster = new TileLayer({
            source: new OSM()
        });
    } else {
        const lib = await import(`./modules/BaseLayers/${baseLayerDefault}.js`);
        raster = lib.getPreviewRaster();
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
