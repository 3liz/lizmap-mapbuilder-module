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