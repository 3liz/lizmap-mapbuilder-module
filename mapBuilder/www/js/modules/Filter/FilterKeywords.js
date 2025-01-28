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

  recFilter(layerTreeElement) {
    let layerKeywords = layerTreeElement.getKeywords();
    const visibility = this.calculateFilter(layerKeywords);
    this.switchAllVisible(visibility);
  }

  calculateFilter(layerKeywords) {
    return this.keywords.some(keyword => layerKeywords.includes(keyword));
  }
}
