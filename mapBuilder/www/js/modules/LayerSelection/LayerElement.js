import {Image as ImageLayer} from 'ol/layer.js';

/**
 * Class representing a layer with some decorator to communicate with the visual component.
 * @property {ImageLayer} _layer Layer associated to the element.
 * @property {string} _uid Layer's uid. We use it to make a link between this object and the visual component where its "id" is the "uid".
 * @property {string} _color Layer's color.
 * @property {boolean} _attributeTableOpened If the attribute table is opened or not.
 * @property {boolean} _infoVisible If the info panel is opened or not.
 */
export class LayerElement {
    /**
     * Create a Layer
     * @param {object} options LayerElement options.
     */
    constructor(options) {
        this._layer = options.layer;
        this._uid = options.uid;
        this._color = options.color;

        this._attributeTableOpened = false;
        this._infoVisible = false;
    }

    /**
     * Get the Layer associated to the element.
     * @returns {ImageLayer} Layer.
     */
    getLayer() {
        return this._layer;
    }

    /**
     * Get the Layer's uid.
     * @returns {string} UID.
     */
    getUid() {
        return this._uid;
    }

    /**
     * Get the state of the attribute table.
     * @returns {boolean} AtributeTable state.
     */
    isAttributeTableOpened() {
        return this._attributeTableOpened;
    }

    /**
     * Get the state of the info panel.
     * @returns {boolean} Info panel state.
     */
    isInfoVisible() {
        return this._infoVisible;
    }

    /**
     * Switch the visibility of the layer.
     */
    switchVisibility() {
        this._layer.setVisible(!this.getLayer().isVisible())
    }

    /**
     * Set the visibility of the attribute table.
     * @param {boolean} value New visibility.
     */
    setAttributeTableVisibility(value) {
        this._attributeTableOpened = value;
    }

    /**
     * Switch the visibility of the info panel.
     */
    switchInfoVisibility() {
        this._infoVisible = !this.isInfoVisible();
    }

    /**
     * Get the color of the layer.
     * @returns {string} Color "rgb(210, 233, 245)".
     */
    getColor() {
        return this._color;
    }

    /**
     * Get the color of the layer with a darker shade.
     * @returns {string} Color "rgb(200, 223, 235)".
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

        return `rgb(${colorValues[0]} ${colorValues[1]} ${colorValues[2]})`
    }
}
