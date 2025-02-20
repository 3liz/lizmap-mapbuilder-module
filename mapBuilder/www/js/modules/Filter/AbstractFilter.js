import { LayerTreeFolder } from "../LayerTree/LayerTreeFolder";

export class AbstractFilter {

    /**
     * Filter the layer tree.
     * @param {LayerTreeFolder[]} layerTree - Layer tree to filter.
     */
    constructor(layerTree) {
        this._layerTree = layerTree;
    }

    /**
     * Filter the layer tree.
     */
    async filter() {
        for (let i = 0; i < this._layerTree.length; i++) {
            this._currentElement = this._layerTree[i];
            this.recFilter(this._layerTree[i]);
        }
    }

    /**
     * Recursive function to filter a layer.
     * @param {import("../LayerTree/LayerTreeFolder").LayerTreeFolder|import("../LayerTree/LayerTreeLayer").LayerTreeLayer} layerTreeElement - Layer tree element to filter.
     */
    // eslint-disable-next-line no-unused-vars
    recFilter(layerTreeElement) {
        throw new Error("Method 'recFilter()' must be implemented.");
    }

    /**
     * Set a layer to a decided visibility.
     * @param {boolean} visibility - Visibility of the layer.
     */
    switchAllVisible(visibility) {
        this.recSwitchAllVisible(this._currentElement, visibility);
    }

    /**
     * Recursive function to set a layer to a decided visibility.
     * @param {import("../LayerTree/LayerTreeFolder").LayerTreeFolder|import("../LayerTree/LayerTreeLayer").LayerTreeLayer} layerTreeElement - Layer tree element to set invisible.
     * @param {boolean} visibility - Visibility of the layer.
     */
    recSwitchAllVisible(layerTreeElement, visibility) {
        if (layerTreeElement instanceof LayerTreeFolder) {
            let children = layerTreeElement.getChildren();
            for (let i = 0; i < children.length; i++) {
                this.recSwitchAllVisible(children[i], visibility);
            }
        }
        layerTreeElement.setVisible(visibility);
    }
}
