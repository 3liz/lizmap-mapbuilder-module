/**
 * @typedef {Object} Options
 * @property {string} [#title] layer's name.
 * @property {boolean} [#popup] popup
 * @property {array} [#bbox] bbox
 * @property {boolean} [#project] project id
 * @property {boolean} [#repository] repository id
 */
export class LayerTreeElement {

  #title;
  #bbox;
  #popup;
  #project;
  #repository;

  constructor(options) {
    this.#title = options.title;

    this.#bbox = options.bbox !== undefined ? options.bbox : undefined;

    this.#popup = options.popup !== undefined ? options.popup : undefined;

    this.#project = options.project !== undefined ? options.project : undefined;

    this.#repository = options.repository !== undefined ? options.repository : undefined;
  }

  getTitle() {
    return this.#title;
  }

  getBbox() {
    return this.#bbox;
  }

  getPopup() {
    return this.#popup;
  }

  getProject() {
    return this.#project;
  }

  getRepository() {
    return this.#repository;
  }
}