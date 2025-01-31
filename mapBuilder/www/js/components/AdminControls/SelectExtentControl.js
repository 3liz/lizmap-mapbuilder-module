import {Control} from "ol/control";
import {Draw} from "ol/interaction";
import {createBox} from "ol/interaction/Draw";
import {transformExtent} from "ol/proj";

/**
 * Class representing a button to draw an extent on the map.
 * @extends Control
 */
export class SelectExtentControl extends Control {
  /**
   * @type {Draw}
   */
  #draw;
  /**
   * @type {boolean}
   */
  #isActive;
  /**
   * @type {HTMLButtonElement}
   */
  #button;
  /**
   * @type {VectorSource}
   */
  #source;
  /**
   * @type {QueueExtent}
   */
  #history;
  /**
   * @type {Map}
   */
  #map;

  /**
   * @typedef {Object} Options
   * @property {VectorSource} [source] Source.
   * @property {QueueExtent} [history] History of extent.
   */
  constructor(opt_options) {

    let options = opt_options || {};

    let button = document.createElement('button');
    button.className = 'fas fa-pen-square';
    button.title = 'Once clicked, select the extent you wish on the map';

    let element = document.createElement('div');
    element.className = 'ol-select-extent ol-unselectable ol-control';
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    this.#button = button;

    this.#isActive = false;

    this.#source = options.source;

    this.#draw = new Draw({
      source: this.#source,
      type: 'Circle',
      geometryFunction: createBox()
    });

    this.#history = options.history;

    //Clear the source when the user starts to draw a new extent
    this.#draw.on('drawstart', () => {
      this.#source.clear();

      //Disable buttons to prevent bugs from user
      this.#button.disabled = true;
      this.#button.id = "control-button-disabled";
      let undoElement = document.querySelector(".ol-do-control-undo")
      undoElement.id = "control-button-disabled";
      undoElement.disabled = true;
      let redoElement = document.querySelector(".ol-do-control-redo")
      redoElement.id = "control-button-disabled";
      redoElement.disabled = true;
    });

    //Set the extent in the input field when the user finishes to draw an extent
    this.#draw.on('drawend', (e) => {
      let tmpExtent = e.feature.getGeometry().getExtent();
      $('#jforms_mapBuilderAdmin_config_extent').val(transformExtent(tmpExtent, 'EPSG:3857', 'EPSG:4326'));

      //Enable button
      this.#button.disabled = false;
      this.#button.id = "";

      this.#history.deleteAllAfter(this.#history.getIndex());

      this.#history.increaseIndex();
      this.#history.addElement(tmpExtent);

      let undoElement = document.querySelector(".ol-do-control-undo")
      undoElement.id = "";
      undoElement.disabled = false;
    });

    this.#button.addEventListener('click', this.handleSelectExtent.bind(this), false);
  }

  //Handle the click event on the button
  handleSelectExtent() {
    if (this.#isActive) {
      this.#map.removeInteraction(this.#draw);
      this.#isActive = false;
      document.querySelector(".fas.fa-pen-square").style.backgroundColor = '';
    } else {
      this.#map.addInteraction(this.#draw);
      this.#isActive = true;
      document.querySelector(".fas.fa-pen-square").style.backgroundColor = '#FFCDCD';
    }
  }

  /**
   * Set the map value.
   * @param {Map} value Map.
   */
  set map(value) {
    this.#map = value;
  }
}
