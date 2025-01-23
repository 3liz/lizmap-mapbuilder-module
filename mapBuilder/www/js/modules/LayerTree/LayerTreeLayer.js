import {v4 as uuidv4} from 'uuid';
import {LayerTreeElement} from "./LayerTreeElement";

/**
 * Class representing a layer in a Layer Tree.
 * @property {boolean} _attributeTable If the layer has an attribute table.
 * @property {string} _name Layer's name.
 * @property {Array} _style Layer's styles.
 * @property {string} _tooltip Layer's tooltip.
 * @property {string} _uuid Layer's uuid. We use it to make a link between this object and the visual component where its "id" is the "uuid"
 * @property {number} _minScale Layer's minScale.
 * @property {number} _maxScale Layer's maxScale.
 */
export class LayerTreeLayer extends LayerTreeElement {
    /**
     * Create a layer in a tree.
     * @param {object} options LayerTreeLayer options.
     */
    constructor(options) {
        super({
            title: options.title,
            popup: options.popup,
            bbox: options.bbox,
            project: options.project,
            repository: options.repository,
            color: options.color
        });

        this._attributeTable = options.attributeTable

        this._name = options.name;

        this._style = options.style;

        this._tooltip = options.tooltip;

        this._uuid = uuidv4();

        this._minScale = options.minScale !== undefined ? options.minScale : undefined;

        this._maxScale = options.maxScale !== undefined ? options.maxScale : undefined;
    }

    /**
     * Know if the layer has an attribute table.
     * @returns {boolean} Attribute table state.
     */
    hasAttributeTable() {
        return this._attributeTable;
    }

    /**
     * Get the Layer's name.
     * @returns {string} Layer's name.
     */
    getName() {
        return this._name;
    }

    /**
     * Get the Layer's styles.
     * @returns {Array} Array of styles.
     */
    getStyle() {
        return this._style;
    }

    /**
     * Get the Layer's tooltip.
     * @returns {string} Layer's tooltip.
     */
    getTooltip() {
        return this._tooltip;
    }

    /**
     * Get the Layer's uuid.
     * @returns {string} Layer's uuid.
     */
    getUuid() {
        return this._uuid;
    }

    /**
     * Get the Layer's minScale.
     * @returns {number} Layer's minScale.
     */
    getMinScale() {
        return this._minScale;
    }

    /**
     * Get the Layer's maxScale.
     * @returns {number} Layer's maxScale.
     */
    getMaxScale() {
        return this._maxScale;
    }
}
