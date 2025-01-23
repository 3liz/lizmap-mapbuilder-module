/***************************************************************************
 * Class used to fill information about the Base Layer OSM StadiaMapsToner *
 ***************************************************************************/

import {Tile as TileLayer} from 'ol/layer.js';
import {StadiaMaps} from 'ol/source.js';

/**
 * Get the raster to create a source for a map.
 * @returns {TileLayer} The raster.
 */
export function getRaster() {
    return new TileLayer({
        source: new StadiaMaps({
            layer: 'stamen_toner_lite'
        })
    });
}


/**
 * Get the raster to create a source for a map.
 * Used in the admin preview.
 * Different function due to some differences in the preview page.
 * @returns {TileLayer} The raster.
 */
export function getPreviewRaster() {
    return getRaster();
}


/**
 * Get the InkMap JSON spec about this layer.
 * @param {StadiaMaps} activeLayer Layer to print.
 * @returns {[{}]} Layer specs.
 */
export function getInkmapSpec(activeLayer) {
    return [{
        "type": "XYZ",
        "url": activeLayer.getUrls()[0]
    }];
}
