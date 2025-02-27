import { AbstractFilter } from "./AbstractFilter";

export class KeywordsFilter extends AbstractFilter {

    /**
     * Filter the layer tree using keywords of layers.
     * @param {[import("../LayerTree/LayerTreeElement").LayerTreeElement]} layerTree - Layer tree to filter.
     * @param {import("./KeywordsManager").KeywordsManager} keywordManager - The keywords manager.
     */
    constructor(layerTree, keywordManager) {
        super(layerTree);
        this.keywordManager = keywordManager;
    }

    setVariables() {
        this.selectedKeywords = this.keywordManager.getSelectedKeywords();
        this.method = this.keywordManager.getCalculationMethod();
    }

    /**
     * Filters the given layer tree element using a recursive filter function.
     * @param {import("../LayerTree/LayerTreeElement").LayerTreeElement} layerTreeElement - The layer tree element to be filtered.
     */
    filterProj(layerTreeElement) {
        let layerKeywords = layerTreeElement.getKeywords();
        this.calculateFilter(layerKeywords);
    }

    /**
     * Calculate if the layer should be visible or not
     * @param {string[]} layerKeywords - Keywords to filter with.
     */
    calculateFilter(layerKeywords) {
        this.setVariables();
        if (this.selectedKeywords.length < 1) {
            return;
        }

        let visibility;

        if (this.method === "union") {
            visibility = this.selectedKeywords.some(keyword => layerKeywords.includes(keyword));
        } else {
            visibility = this.selectedKeywords.every(keyword => layerKeywords.includes(keyword));
        }
        this._currentProject.setVisible(visibility);
    }
}
