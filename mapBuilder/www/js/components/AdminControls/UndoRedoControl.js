import {Control} from "ol/control";
import Feature from "ol/Feature";
import {fromExtent} from "ol/geom/Polygon";
import {transformExtent} from "ol/proj";

/**
 * Class representing a control to undo and redo the extent drawn on the map.
 * @augments Control
 * @typedef {object} Vector
 * @typedef {object} QueueExtent
 * @property {Vector} _source Source.
 * @property {QueueExtent} _history History of extent.
 * @property {Map} _map Map.
 */
export class UndoRedoControl extends Control {
    /**
     * Create a control to undo and redo the extent drawn on the map.
     * @param {object} options UndoRedoControl options.
     */
    constructor(options) {
        options = options ? options : {};

        super({
            element: document.createElement('div'),
            target: options.target,
        });

        this._history = options.history;

        this._source = options.source;

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

        if (this._history.getIndex() === 0) {
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
        this._source.clear();
        this._history.decreaseIndex();
        var extent = this._history.getElementAt(this._history.getIndex());
        document.getElementById("jforms_mapBuilderAdmin_config_extent").value = transformExtent(extent, this._map.getView().getProjection(), 'EPSG:4326');

        this._source.addFeature(
            new Feature({
                geometry: fromExtent(extent)
            })
        );

        if (this._history.getIndex() <= 0) {
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
        this._source.clear();
        this._history.increaseIndex();
        var extent = this._history.getElementAt(this._history.getIndex());
        document.getElementById("jforms_mapBuilderAdmin_config_extent").value = transformExtent(extent, this._map.getView().getProjection(), 'EPSG:4326');

        this._source.addFeature(
            new Feature({
                geometry: fromExtent(extent)
            })
        );

        if (this._history.getIndex() >= this._history.getLength() - 1) {
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
        this._map = value;
    }
}
