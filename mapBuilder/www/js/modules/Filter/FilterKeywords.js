import { AbstractFilter } from "./AbstractFilter";

export class KeywordsFilter extends AbstractFilter {

  /**
   * Filter the layer tree using keywords of layers.
   * @param {[LayerTreeElement]} layerTree - Layer tree to filter.
   */
  constructor(layerTree, keywords) {
    super(layerTree);
    this.keywords = keywords;
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
    const visibility = this.keywords.some(keyword => layerKeywords.includes(keyword));
    this._currentProject.setVisible(visibility);
  }
}
