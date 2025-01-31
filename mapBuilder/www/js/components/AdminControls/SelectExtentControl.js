import {Control} from "ol/control";
import {Draw} from "ol/interaction";
import {createBox} from "ol/interaction/Draw";
import {transformExtent} from "ol/proj";

/**
 * @augments Control
 * @typedef {object} HTMLButtonElement
 * @typedef {object} Vector
 * @typedef {object} QueueExtent
 * @property {Draw} _draw Draw.
 * @property {boolean} _isActive Is active.
 * @property {HTMLButtonElement} _button Button.
 * @property {Vector} _source Source.
 * @property {QueueExtent} _history History of extent.
 * @property {Map} _map Map.
 */
export class SelectExtentControl extends Control {
    /**
     * Class representing a button to draw an extent on the map.
     * @param {object} opt_options Control options.
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

        this._button = button;

        this._isActive = false;

        this._source = options.source;

        this._draw = new Draw({
            source: this._source,
            type: 'Circle',
            geometryFunction: createBox()
        });

        this._history = options.history;

        //Clear the source when the user starts to draw a new extent
        this._draw.on('drawstart', () => {
            this._source.clear();

            //Disable buttons to prevent bugs from user
            this._button.disabled = true;
            this._button.id = "control-button-disabled";
            let undoElement = document.querySelector(".ol-do-control-undo")
            undoElement.id = "control-button-disabled";
            undoElement.disabled = true;
            let redoElement = document.querySelector(".ol-do-control-redo")
            redoElement.id = "control-button-disabled";
            redoElement.disabled = true;
        });

        //Set the extent in the input field when the user finishes to draw an extent
        this._draw.on('drawend', (e) => {
            let tmpExtent = e.feature.getGeometry().getExtent();
            $('#jforms_mapBuilderAdmin_config_extent').val(transformExtent(tmpExtent, 'EPSG:3857', 'EPSG:4326'));

            //Enable button
            this._button.disabled = false;
            this._button.id = "";

            this._history.deleteAllAfter(this._history.getIndex());

            this._history.increaseIndex();
            this._history.addElement(tmpExtent);

            let undoElement = document.querySelector(".ol-do-control-undo")
            undoElement.id = "";
            undoElement.disabled = false;
        });

        this._button.addEventListener('click', this.handleSelectExtent.bind(this), false);
    }

    //Handle the click event on the button
    handleSelectExtent() {
        if (this._isActive) {
            this._map.removeInteraction(this._draw);
            this._isActive = false;
            document.querySelector(".fas.fa-pen-square").style.backgroundColor = '';
        } else {
            this._map.addInteraction(this._draw);
            this._isActive = true;
            document.querySelector(".fas.fa-pen-square").style.backgroundColor = '#FFCDCD';
        }
    }

    /**
     * Set the map value.
     * @param {Map} value Map.
     */
    set map(value) {
        this._map = value;
    }
}
