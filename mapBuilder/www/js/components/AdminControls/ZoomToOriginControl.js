import {Control} from "ol/control";
import {transformExtent} from "ol/proj";

/**
 * Class representing a button to zoom to the origin of the map.
 * @augments Control
 * @property {boolean} _isPreview If the button is in a preview context.
 */
export class ZoomToOriginControl extends Control {
    /**
     * Create a button to zoom to the origin of the map.
     * @param {object} opt_options ZoomToOriginControl options.
     */
    constructor(opt_options) {

        let options = opt_options || {};

        let button = document.createElement('button');
        button.className = 'fas fa-expand-arrows-alt';
        button.title = 'Zoom to selected map extent';

        let element = document.createElement('div');
        element.className = 'ol-zoom-origin ol-unselectable ol-control';
        if (opt_options.isPreview) {
            element.id = 'preview';
        }
        element.appendChild(button);

        super({
            element: element,
            target: options.target,
        });

        this._isPreview = opt_options.isPreview;
        button.addEventListener('click', this.handleZoomToOrigin.bind(this), false);
    }

    /**
     * Handle click event to adjust the view;
     */
    handleZoomToOrigin() {
        let extent;
        if (this._isPreview) {
            extent = document.getElementById("_extent").textContent.split(',').map(parseFloat);
        } else {
            extent = document.getElementById("jforms_mapBuilderAdmin_config_extent").value.split(',').map(parseFloat);
        }

        extent = transformExtent(extent, 'EPSG:4326', 'EPSG:3857');

        this.getMap().getView().fit(extent, {
            duration: 250
        });
    };
}
