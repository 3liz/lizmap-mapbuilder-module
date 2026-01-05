import { LayerTreeProject } from "../LayerTree/LayerTreeProject";

export class AbstractFilter {

    /**
     * Filter the layer tree.
     * @param {import("../../components/LayerStore").LayerStore} layerStore - Layer Store tree to filter.
     */
    constructor(layerStore) {
        this._layerStore = layerStore;
    }

    /**
     * Filter the layer tree.
     */
    filter() {
        this._layerTree = this._layerStore.getTree();
        for (let i = 0; i < this._layerTree.length; i++) {
            this._currentFolder = this._layerTree[i];
            for (let k = 0; k < this._currentFolder.getChildren().length; k++) {
                if (this._currentFolder.getChildren()[k] instanceof LayerTreeProject) {
                    this._currentProject = this._currentFolder.getChildren()[k]
                    if (this._currentProject.isVisible()) {
                        this.filterProj(this._currentProject);
                    }
                }
            }
        }
        this._layerStore.updateTree(this._layerTree);
    }

    /**
     * Filters the given layer tree element based on specific criteria.
     * @param {import("../LayerTree/LayerTreeElement").LayerTreeElement} layerTreeElement - The layer tree element to be filtered.
     * @throws {Error} Throws an error if the method is not implemented.
     */
    // eslint-disable-next-line no-unused-vars
    filterProj(layerTreeElement) {
        throw new Error("Method 'filterProj()' must be implemented.");
    }
}
