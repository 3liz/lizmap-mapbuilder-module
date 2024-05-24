import {Image as ImageLayer} from 'ol/layer.js';

export class LayerElement {

  #layer;
  #uid;
  #visible;
  #attributeTableOpened;
  #infoVisible;

  /**
   * @typedef {Object} Options
   * @property {ImageLayer} [#layer] layer associated to the element
   * @property {string} [#uid] layer's uid
   * @property {boolean} [#visible] if the folder is visible or not
   * @property {boolean} [#attributeTableOpened] if the attribute table is opened or not
   * @property {boolean} [#infoVisible] if the info panel is opened or not
   */
  constructor(options) {
    this.#layer = options.layer;
    this.#uid = options.uid;

    this.#visible = true;
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
  isVisible() {
    return this.#visible;
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
    this.#visible = !this.isVisible();
    if (this.isVisible()) {
      this.#layer.setVisible(true)
    } else {
      this.#layer.setVisible(false)
    }
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