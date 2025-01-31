import {Control} from "ol/control";
import Feature from "ol/Feature";
import {fromExtent} from "ol/geom/Polygon";
import {transformExtent} from "ol/proj";

/**
 * Class representing a control to undo and redo the extent drawn on the map.
 * @extends Control
 */
export class UndoRedoControl extends Control {
  /**
   * @type {QueueExtent}
   */
  #history;
  /**
   * @type {VectorSource}
   */
  #source;
  /**
   * @type {Map}
   */
  #map;

  /**
   * @typedef {Object} Options
   * @property {VectorSource} [source] Source.
   * @property {QueueExtent} [history] History of extent.
   */
  constructor(options) {
    options = options ? options : {};

    super({
      element: document.createElement('div'),
      target: options.target,
    });

    this.#history = options.history;

    this.#source = options.source;

    const className = 'ol-do-control';

    //Create the undo button
    const undoElement = document.createElement('button');
    undoElement.className = className + '-undo fas fa-undo-alt';
    undoElement.setAttribute('type', 'button');
    undoElement.title = 'Undo';

    undoElement.addEventListener('click', this.undo.bind(this), false);

    //Create the redo button
    const redoElement = document.createElement('button');
    redoElement.className = className + '-redo fas fa-redo-alt';
    redoElement.setAttribute('type', 'button');
    redoElement.title = 'Redo';

    redoElement.addEventListener('click', this.redo.bind(this), false);

    const cssClasses =
      className + ' ol-unselectable ol-control';
    const element = this.element;
    element.className = cssClasses;
    element.appendChild(undoElement);
    element.appendChild(redoElement);

    this.undoEl = undoElement;
    this.redoEl = redoElement;

    if (this.#history.getIndex() === 0) {
      undoElement.id = "control-button-disabled";
      undoElement.disabled = true;
    }

    redoElement.id = "control-button-disabled";
    redoElement.disabled = true;
  }

  /**
   * Undo the last extent drawn on the map.
   */
  undo() {
    this.#source.clear();
    this.#history.decreaseIndex();
    var extent = this.#history.getElementAt(this.#history.getIndex());
    document.getElementById("jforms_mapBuilderAdmin_config_extent").value = transformExtent(extent, this.#map.getView().getProjection(), 'EPSG:4326');

    this.#source.addFeature(
      new Feature({
        geometry: fromExtent(extent)
      })
    );

    if (this.#history.getIndex() <= 0) {
      this.undoEl.id = "control-button-disabled";
      this.undoEl.disabled = true;
    }
    this.redoEl.id = "";
    this.redoEl.disabled = false;
  }

  /**
   * Redo the last extent drawn on the map.
   */
  redo() {
    this.#source.clear();
    this.#history.increaseIndex();
    var extent = this.#history.getElementAt(this.#history.getIndex());
    document.getElementById("jforms_mapBuilderAdmin_config_extent").value = transformExtent(extent, this.#map.getView().getProjection(), 'EPSG:4326');

    this.#source.addFeature(
      new Feature({
        geometry: fromExtent(extent)
      })
    );

    if (this.#history.getIndex() >= this.#history.getLength() - 1) {
      this.redoEl.id = "control-button-disabled";
      this.redoEl.disabled = true;
    }
    this.undoEl.id = "";
    this.undoEl.disabled = false;
  }

  /**
   * Set the map value.
   * @param {Map} value Map.
   */
  set map(value) {
    this.#map = value;
  }
}
