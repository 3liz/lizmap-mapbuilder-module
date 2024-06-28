/** Class representing a node in a Layer Tree. */
export class LayerTreeElement {

  /**
   * @type {string} Branch title.
   */
  #title;
  /**
   * @type {array} Bbox.
   */
  #bbox;
  /**
   * @type {boolean} Popup.
   */
  #popup;
  /**
   * @type {string} Project id.
   */
  #project;
  /**
   * @type {string} Repository id.
   */
  #repository;
  /**
   * @type {string} Color of the layer in the CSS sheet.
   */
  #color;

  /**
   * @typedef {Object} Options
   * @property {string} [#title] Branch title.
   * @property {array} [#bbox] Bbox.
   * @property {boolean} [#popup] Popup.
   * @property {string} [#project] Project id.
   * @property {string} [#repository] Repository id.
   * @property {string} [#color] Color of the layer in the CSS sheet.
   */
  constructor(options) {
    this.#title = options.title;

    this.#bbox = options.bbox !== undefined ? options.bbox : undefined;

    this.#popup = options.popup !== undefined ? options.popup : undefined;

    this.#project = options.project !== undefined ? options.project : undefined;

    this.#repository = options.repository !== undefined ? options.repository : undefined;

    this.#color = options.color !== undefined ? options.color : undefined;

    if (this.#color === undefined) {
      this.#color = this.generateColor();
    }
  }

  /**
   * Used to generate a light color using the RGB pattern.
   * We use only values between 210 -> 245 to get light colors.
   * @return {string} Color with RGB pattern : "rgb(x x x)".
   */
  generateColor() {
    /**
     * @param {number} [min] Minimum value.
     * @param {number} [max] Maximum value.
     * @return {number} Random integer between min and max.
     */
    function getRandInteger(min, max) {
      return Math.floor(Math.random() * (max + 1 - min)) + min;
    }

    let listValue = [
      getRandInteger(210, 255),
      getRandInteger(210, 255),
      getRandInteger(210, 255)
    ]

    let min = Math.min(...listValue);
    listValue[listValue.indexOf(min)] = 210;

    let max = Math.max(...listValue);
    listValue[listValue.indexOf(max)] = 255;

    return `rgb(${listValue[0]} ${listValue[1]} ${listValue[2]})`;
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
    return `rgb(${colorValues[0]} ${colorValues[1]} ${colorValues[2]})`;
  }

  /**
   * Get the title of the branch.
   * @return {string} Branch title.
   */
  getTitle() {
    return this.#title;
  }

  /**
   * Get the bbox.
   * @return {Array} Bbox.
   */
  getBbox() {
    return this.#bbox;
  }

  /**
   * Get the popup.
   * @return {boolean} Popup.
   */
  getPopup() {
    return this.#popup;
  }

  /**
   * Get the project id.
   * @return {string} Project id.
   */
  getProject() {
    return this.#project;
  }

  /**
   * Get the repository id.
   * @return {string} Repository id.
   */
  getRepository() {
    return this.#repository;
  }

  /**
   * Get the color of the layer.
   * @return {string} Color "rgb(210, 233, 245)".
   */
  getColor() {
    return this.#color;
  }
}