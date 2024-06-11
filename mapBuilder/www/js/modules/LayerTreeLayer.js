import {v4 as uuidv4} from 'uuid';
import {LayerTreeElement} from "./LayerTreeElement";

/**
 * @typedef {Object} Options
 * @property {boolean} [#attributeTable] if the layer has an attribute table
 * @property {string} [#name] name
 * @property {array} [#style] style
 * @property {string} [#tooltip] layer's tooltip.
 * @property {string} [#uuid] layer's uuid
 * @property {number} [#minScale] layer's minScale
 * @property {number} [#maxScale] layer's maxScale
 */
export class LayerTreeLayer extends LayerTreeElement {

  #attributeTable;
  #name;
  #style;
  #tooltip;
  #uuid;
  #minScale;
  #maxScale;

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

  hasAttributeTable() {
    return this.#attributeTable;
  }

  getName() {
    return this.#name;
  }

  getStyle() {
    return this.#style;
  }

  getTooltip() {
    return this.#tooltip;
  }

  getUuid() {
    return this.#uuid;
  }

  getMinScale() {
    return this.#minScale;
  }

  getMaxScale() {
    return this.#maxScale;
  }
}