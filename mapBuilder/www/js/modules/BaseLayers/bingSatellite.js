/**********************************************************************
 * Class used to fill information about the Base Layer Bing Satellite *
 **********************************************************************/

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
      imagerySet: "Aerial"
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
  return new TileLayer({
    visible: true,
    preload: Infinity,
    source: new BingMaps({
      key: document.getElementById("_baseLayerKeyBing").textContent,
      imagerySet: "Aerial"
    })
  });
}


/**
 * Get the InkMap JSON spec about this layer.
 * @param {BingMaps} activeLayer Layer to print.
 * @returns {[{}]} Layer specs.
 */
export function getInkmapSpec(activeLayer) {
  return [{
    "type": "BingMaps",
    "imagerySet": activeLayer.getImagerySet(),
    "apiKey": activeLayer.getApiKey(),
  }];
}
