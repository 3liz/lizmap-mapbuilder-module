import { AbstractFilter } from "./AbstractFilter";

export class KeywordsFilter extends AbstractFilter {

  /**
   * Filter the layer tree using keywords of layers.
   * @param {[LayerTreeElement]} layerTree - Layer tree to filter.
   */
  constructor(layerTree, keywords, method) {
    super(layerTree);
    this.keywords = keywords;
    this.method = method;
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
    if (this.keywords.length < 1) {
      return false;
    }

    let visibility;

    if (this.method === "union") {
      visibility = this.keywords.some(keyword => layerKeywords.includes(keyword));
    } else {
      visibility = this.keywords.every(keyword => layerKeywords.includes(keyword));
    }
    this._currentProject.setVisible(visibility);
  }
}
