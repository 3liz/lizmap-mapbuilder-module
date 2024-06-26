import {v4 as uuidv4} from 'uuid';
import {LayerTreeElement} from "./LayerTreeElement";

/** Class representing a layer in a Layer Tree. */
export class LayerTreeLayer extends LayerTreeElement {

  /**
   * @type {boolean} If the layer has an attribute table.
   */
  #attributeTable;
  /**
   * @type {string} Layer's name.
   */
  #name;
  /**
   * @type {array} Layer's styles.
   */
  #style;
  /**
   * @type {string} Layer's tooltip.
   */
  #tooltip;
  /**
   * @type {string} Layer's uuid.
   * We use it to make a link between this object and
   * the visual component where its "id" is the "uuid".
   */
  #uuid;
  /**
   * @type {number} Layer's minScale.
   */
  #minScale;
  /**
   * @type {number} Layer's maxScale.
   */
  #maxScale;

  /**
   * @typedef {Object} Options
   * @property {boolean} [#attributeTable] If the layer has an attribute table.
   * @property {string} [#name] Layer's name.
   * @property {array} [#style] Layer's styles.
   * @property {string} [#tooltip] Layer's tooltip.
   * @property {string} [#uuid] Layer's uuid.
   * @property {number} [#minScale] Layer's minScale.
   * @property {number} [#maxScale] Layer's maxScale.
   */
  constructor(options) {
    super({
      title: options.title,
      popup: options.popup,
      bbox: options.bbox,
      project: options.project,
      repository: options.repository,
      color: options.color
    });

    this.#attributeTable = options.attributeTable

    this.#name = options.name;

    this.#style = options.style;

    this.#tooltip = options.tooltip;

    this.#uuid = uuidv4();

    this.#minScale = options.minScale !== undefined ? options.minScale : undefined;

    this.#maxScale = options.maxScale !== undefined ? options.maxScale : undefined;
  }

  /**
   * Know if the layer has an attribute table.
   * @return {boolean}
   */
  hasAttributeTable() {
    return this.#attributeTable;
  }

  /**
   * Get the Layer's name.
   * @return {string} Layer's name.
   */
  getName() {
    return this.#name;
  }

  /**
   * Get the Layer's styles.
   * @return {Array} Array of styles.
   */
  getStyle() {
    return this.#style;
  }

  /**
   * Get the Layer's tooltip.
   * @return {string} Layer's tooltip.
   */
  getTooltip() {
    return this.#tooltip;
  }

  /**
   * Get the Layer's uuid.
   * @return {string} Layer's uuid.
   */
  getUuid() {
    return this.#uuid;
  }

  /**
   * Get the Layer's minScale.
   * @return {number} Layer's minScale.
   */
  getMinScale() {
    return this.#minScale;
  }

  /**
   * Get the Layer's maxScale.
   * @return {number} Layer's maxScale.
   */
  getMaxScale() {
    return this.#maxScale;
  }
}