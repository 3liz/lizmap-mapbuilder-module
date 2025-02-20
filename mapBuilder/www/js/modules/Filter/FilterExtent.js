import { intersects } from 'ol/extent';
import { transformExtent } from "ol/proj";
import { AbstractFilter } from "./AbstractFilter";

export class ExtentFilter extends AbstractFilter {

    /**
     * Filter the layer tree using extent of layers.
     * @param {[import("../LayerTree/LayerTreeElement").LayerTreeElement]} layerTree - Layer tree to filter.
     */
    constructor(layerTree) {
        super(layerTree);
    }

    /**
     * Recursive function to filter a layer.
     * @param {import("../LayerTree/LayerTreeElement").LayerTreeElement} layerTreeElement - Layer tree element to filter.
     */
    recFilter(layerTreeElement) {
        if (layerTreeElement.getBbox()) {
            const visibility = this.calculateFilter(layerTreeElement);
            this.switchAllVisible(visibility);
            return;
        }
        if (!layerTreeElement.hasChildren()) {
            return;
        }
        let children = layerTreeElement.getChildren();
        for (let i = 0; i < children.length; i++) {
            this.recFilter(children[i]);
        }
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

        let visible = intersects(layerExtent, mapBuilderExtent);
        layerTreeElement.setVisible(visible);
        return visible
    }

}
