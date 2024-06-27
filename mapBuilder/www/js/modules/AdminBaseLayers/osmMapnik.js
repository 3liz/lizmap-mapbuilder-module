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