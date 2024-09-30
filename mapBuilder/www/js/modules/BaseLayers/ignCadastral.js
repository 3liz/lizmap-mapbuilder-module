/*********************************************************************
 * Class used to fill information about the Base Layer IGN Cadastral *
 *********************************************************************/

import {Tile as TileLayer} from 'ol/layer.js';
import {WMTS} from 'ol/source.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import {get as getProjection} from 'ol/proj.js';
import {getWidth} from 'ol/extent.js';

/**
 * Get the raster to create a source for a map.
 * @returns {TileLayer} The raster.
 */
export function getRaster() {

  let resolutions = [];
  let matrixIds = [];
  let proj3857 = getProjection('EPSG:3857');
  let maxResolution = getWidth(proj3857.getExtent()) / 256;

  for (let i = 0; i < 20; i++) {
    matrixIds[i] = i.toString();
    resolutions[i] = maxResolution / Math.pow(2, i);
  }

  let tileGrid = new WMTSTileGrid({
    origin: [-20037508, 20037508],
    resolutions: resolutions,
    matrixIds: matrixIds
  });

  let ign_source = new WMTS({
    url: "https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile",
    layer: "CADASTRALPARCELS.PARCELLAIRE_EXPRESS",
    matrixSet: 'PM',
    format: "image/png",
    projection: 'EPSG:3857',
    tileGrid: tileGrid,
    style: 'normal',
    attributions: `<a href="https://www.ign.fr/" target="_blank">
          <img src="https://wxs.ign.fr/static/logos/IGN/IGN.gif" 
          title="Institut national de l'information géographique et forestière" alt="IGN"></a>`
  });

  return new TileLayer({
    source: ign_source
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
 * @param {WMTS} activeLayer Layer to print.
 * @returns {[{}]} Layer specs.
 */
export function getInkmapSpec(activeLayer) {
  return [{
    "type": "WMTS",
    "url": activeLayer.getUrls()[0],
    "layer": activeLayer.getLayer(),
    "matrixSet": "PM",
    "projection": "EPSG:3857",
    "format": activeLayer.getFormat(),
    "style": "normal",
    "tileGrid": {
      "matrixIds": activeLayer.getTileGrid().getMatrixIds(),
      "resolutions": activeLayer.getTileGrid().getResolutions(),
      "tileSize": activeLayer.getTileGrid().getTileSize()
    }
  }];
}
