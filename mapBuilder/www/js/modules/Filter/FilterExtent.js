import { intersects } from 'ol/extent';
import { transformExtent } from "ol/proj";
import { AbstractFilter } from "./AbstractFilter";

export class ExtentFilter extends AbstractFilter {

    /**
     * Filter the layer tree using extent of layers.
     * @param {[import("../LayerTree/LayerTreeFolder").LayerTreeFolder]} layerTree - Layer tree to filter.
     */
    constructor(layerTree) {
        super(layerTree);
    }

    /**
     * Filters the given layer tree element using a recursive filter function.
     * @param {import("../LayerTree/LayerTreeElement").LayerTreeElement} layerTreeElement - The layer tree element to be filtered.
     */
    filterProj(layerTreeElement) {
        this.calculateFilter(layerTreeElement);
    }

    /**
     * Calculate if the layer should be visible or not
     * @param {import("../LayerTree/LayerTreeElement").LayerTreeElement} layerTreeElement - Layer tree element to filter
     * @returns {boolean} Visibility of the layer.
     */
    calculateFilter(layerTreeElement) {
        let layerExtent = layerTreeElement.getBbox();
        let currentExtent = mapBuilder.map.getView().calculateExtent();
        let currentProjection = mapBuilder.map.getView().getProjection();
        let mapBuilderExtent = transformExtent(currentExtent, currentProjection, 'EPSG:4326');

        let visible = true;
        if (layerExtent) {
            visible = intersects(layerExtent, mapBuilderExtent);
        }
        this._currentProject.setVisible(visible);
        return visible
    }

}
