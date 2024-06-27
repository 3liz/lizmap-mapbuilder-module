/********************************************************************
 * Class used to fill information about the Base Layer Bing Streets *
 ********************************************************************/

import {Tile as TileLayer} from 'ol/layer.js';
import {BingMaps} from 'ol/source.js';

/**
 * Get the raster to create a source for a map.
 * @returns {TileLayer} The raster.
 */
export function getRaster() {
  return new TileLayer({
    visible: true,
    preload: Infinity,
    source: new BingMaps({
      key: document.getElementById("jforms_mapBuilderAdmin_config_baseLayerKeyBing").value,
      imagerySet: "Road"
    })
  });
}