/******************************************************************
 * Class used to fill information about the Base Layer OSM Mapnik *
 ******************************************************************/

import {Tile as TileLayer} from 'ol/layer.js';
import {OSM} from 'ol/source.js';

/**
 * Get the raster to create a source for a map.
 * @returns {TileLayer} The raster.
 */
export function getRaster() {
    return new TileLayer({
        source: new OSM()
    });
}

/**
 * Get the InkMap JSON spec about this layer.
 * @param {OSM} activeLayer Layer to print.
 * @returns {[{}]} Layer specs.
 */
export function getInkmapSpec(activeLayer) {
    return [{
        "type": "XYZ",
        "url": activeLayer.getUrls()[0]
    }];
}