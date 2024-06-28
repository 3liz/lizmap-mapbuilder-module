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
      imagerySet: "Road"
    })
  });
}


/**
 * Get the InkMap JSON spec about this layer.
 * @param {BingMaps} activeLayer Layer to print.
 * @returns {[{}]|number} Layer specs.
 */
export function getInkmapSpec(activeLayer) {
  if (activeLayer.getApiKey() === '') {
    return 10;
  }
  return [{
    "type": "BingMaps",
    "imagerySet": activeLayer.getImagerySet(),
    "apiKey": activeLayer.getApiKey(),
  }];
}
