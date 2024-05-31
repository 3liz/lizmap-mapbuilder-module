import {Image as ImageLayer} from 'ol/layer.js';

export class LayerElement {

  #layer;
  #uid;
  #attributeTableOpened;
  #infoVisible;

  /**
   * @typedef {Object} Options
   * @property {ImageLayer} [#layer] layer associated to the element
   * @property {string} [#uid] layer's uid
   * @property {boolean} [#attributeTableOpened] if the attribute table is opened or not
   * @property {boolean} [#infoVisible] if the info panel is opened or not
   */
  constructor(options) {
    this.#layer = options.layer;
    this.#uid = options.uid;

    this.#attributeTableOpened = false;
    this.#infoVisible = false;
  }

  /**
   * @returns {ImageLayer}
   */
  getLayer() {
    return this.#layer;
  }

  /**
   * @returns {string}
   */
  getUid() {
    return this.#uid;
  }

  /**
   * @returns {boolean}
   */
  isAttributeTableOpened() {
    return this.#attributeTableOpened;
  }

  /**
   * @returns {boolean}
   */
  isInfoVisible() {
    return this.#infoVisible;
  }

  switchVisibility() {
    this.#layer.setVisible(!this.getLayer().isVisible())
  }

  /**
   * @param {boolean} value
   */
  setAttributeTableVisibility(value) {
    this.#attributeTableOpened = value;
  }

  switchInfoVisibility() {
    this.#infoVisible = !this.isInfoVisible();
  }

}