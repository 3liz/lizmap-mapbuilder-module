/**
 * @typedef {Object} Options
 * @property {string} [#title] layer's name.
 * @property {boolean} [#popup] popup
 * @property {array} [#bbox] bbox
 * @property {string} [#project] project id
 * @property {string} [#repository] repository id
 * @property {string} [#color] color of the layer in the CSS sheet
 */
export class LayerTreeElement {

  #title;
  #bbox;
  #popup;
  #project;
  #repository;
  #color;

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
   * Used to generate a light color using the RGB pattern
   * We use only values between 210 -> 245 to get light colors
   * @return {string} color with RGB pattern : "rgb(x x x)"
   */
  generateColor() {
    /**
     * @param {number} [min]
     * @param {number} [max]
     * @return {number}
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

  getColor() {
    return this.#color;
  }
}