import {Image as ImageLayer} from 'ol/layer.js';

export class LayerElement {

  #layer;
  #uid;
  #attributeTableOpened;
  #infoVisible;
  #color;

  /**
   * @typedef {Object} Options
   * @property {ImageLayer} [#layer] layer associated to the element
   * @property {string} [#uid] layer's uid
   * @property {boolean} [#attributeTableOpened] if the attribute table is opened or not
   * @property {boolean} [#infoVisible] if the info panel is opened or not
   * @property {string} [#color] layer's color
   */
  constructor(options) {
    this.#layer = options.layer;
    this.#uid = options.uid;
    this.#color = options.color;

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

  /**
   * @return {string}
   */
  getColor() {
    return this.#color;
  }

  getHoverColor() {
    let colorString = this.getColor().split(" ");
    let colorValues = [
      colorString[0].split("(")[1],
      colorString[1],
      colorString[2].split(")")[0]
    ];

    for (let i = 0; i < 3; i++) {
      colorValues[i] = parseInt(colorValues[i]) - 10;
    }

    return `rgb(${colorValues[0]} ${colorValues[1]} ${colorValues[2]})`
  }
}