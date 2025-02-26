import { LayerTreeFolder } from "../LayerTree/LayerTreeFolder";
import { LayerTreeProject } from "../LayerTree/LayerTreeProject";

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
            this._currentFolder = this._layerTree[i];
            for (let k = 0; k < this._currentFolder.getChildren().length; k++) {
                if (this._currentFolder.getChildren()[k] instanceof LayerTreeProject) {
                    this._currentProject = this._currentFolder.getChildren()[k]
                    this.filterProj(this._currentProject);
                }
            }
        }
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
