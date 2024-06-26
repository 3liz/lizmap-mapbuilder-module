import {Image as ImageLayer} from 'ol/layer.js';

/** Class representing a layer with some decorator to communicate with the visual component. */
export class LayerElement {

  /**
   * @type {ImageLayer} Layer associated to the element.
   */
  #layer;
  /**
   * @type {string} Layer's uid.
   * We use it to make a link between this object and
   * the visual component where its "id" is the "uid".
   */
  #uid;
  /**
   * @type {boolean} If the attribute table is opened or not.
   */
  #attributeTableOpened;
  /**
   * @type {boolean} If the info panel is opened or not.
   */
  #infoVisible;
  /**
   * @type {string} Layer's color.
   */
  #color;

  /**
   * @typedef {Object} Options
   * @property {ImageLayer} layer Layer associated to the element.
   * @property {string} uid Layer's uid.
   * @property {string} color Layer's color.
   * @property {boolean} [attributeTableOpened] If the attribute table is opened or not.
   * @property {boolean} [infoVisible] If the info panel is opened or not.
   */
  constructor(options) {
    this.#layer = options.layer;
    this.#uid = options.uid;
    this.#color = options.color;

    this.#attributeTableOpened = false;
    this.#infoVisible = false;
  }

  /**
   * Get the Layer associated to the element.
   * @returns {ImageLayer} Layer.
   */
  getLayer() {
    return this.#layer;
  }

  /**
   * Get the Layer's uid.
   * @returns {string} UID.
   */
  getUid() {
    return this.#uid;
  }

  /**
   * Get the state of the attribute table.
   * @returns {boolean} AtributeTable state.
   */
  isAttributeTableOpened() {
    return this.#attributeTableOpened;
  }

  /**
   * Get the state of the info panel.
   * @returns {boolean} Info panel state.
   */
  isInfoVisible() {
    return this.#infoVisible;
  }

  /**
   * Switch the visibility of the layer.
   */
  switchVisibility() {
    this.#layer.setVisible(!this.getLayer().isVisible())
  }

  /**
   * Set the visibility of the attribute table.
   * @param {boolean} value New visibility.
   */
  setAttributeTableVisibility(value) {
    this.#attributeTableOpened = value;
  }

  /**
   * Switch the visibility of the info panel.
   */
  switchInfoVisibility() {
    this.#infoVisible = !this.isInfoVisible();
  }

  /**
   * Get the color of the layer.
   * @return {string} Color "rgb(210, 233, 245)".
   */
  getColor() {
    return this.#color;
  }

  /**
   * Get the color of the layer with a darker shade.
   * @return {string} Color "rgb(200, 223, 235)".
   */
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