import {LayerTreeFolder} from "./LayerTreeFolder";
import {extend} from 'ol/extent';

/**
 *  Class representing a folder that represents a project.
 *  @property {boolean} _lazy If the folder will have to load children from a project.
 *  @property {boolean} _loading Loading state of the folder.
 *  @property {boolean} _failed If the folder got a load error.
 * @property {boolean} _visible Visibility of the layer for filtering.
 * @property {string[]} _keywords Keywords of the project.
 */
export class LayerTreeProject extends LayerTreeFolder {

    constructor(options) {
        super({
            title: options.title,
            popup: options.popup,
            bbox: options.bbox,
            project: options.project,
            projectName: options.title,
            repository: options.repository,
            color: options.color
        });

        this._lazy = options.lazy !== undefined ? options.lazy : undefined;

        this._loading = false;

        this._failed = false;

        this._visible = true;

        this._keywords = [];
    }

    /**
     * Load a bbox value for the project that includes all children bbox.
     * It is used for filtering.
     */
    loadBbox() {
        const firstBbox = this.getFirstBbox(this._children[0]);
        this.setBbox(this.recLoadBbox(this, firstBbox));
    }

    /**
     * Retrieves the first bounding box (bbox) found in the given project.
     * @param {object} layerTreeElement - The layer tree element to search for a bounding box.
     * @returns {import("ol/extent").Extent} The bounding box object of the first layer tree element.
     * @throws {Error} If no layer in the tree contains a bounding box.
     */
    getFirstBbox(layerTreeElement) {
        if (layerTreeElement.getBbox()) {
            return layerTreeElement.getBbox();
        } else if (layerTreeElement.hasChildren()) {
            let children = layerTreeElement.getChildren();
            for (let i = 0; i < children.length; i++) {
                if (layerTreeElement.getBbox()) {
                    return layerTreeElement.getBbox();
                }
            }
        }
        throw new Error("Project doesn't have layers with bbox.")
    }

    /**
     * Recursive func used to return a bbox.
     * @param {import("./LayerTreeElement").LayerTreeElement} layerTreeElement - Current element in the tree
     * @param {import("ol/extent").Extent} currentBbox - Current bbox
     * @returns {import("ol/extent").Extent} A bbox.
     */
    recLoadBbox(layerTreeElement, currentBbox) {
        if (layerTreeElement.getBbox()) {
            return layerTreeElement.getBbox();
        }
        for (let i = 0; i < this._children.length; i++) {
            currentBbox = extend(
                currentBbox,
                this.recLoadBbox(
                    layerTreeElement.getChildren()[i],
                    currentBbox
                )
            );
        }
        return currentBbox
    }

    /**
     * Get the status of the folder.
     * @returns {boolean} Status of the folder.
     */
    isLazy() {
        return !!this._lazy;
    }

    /**
     * Set the lazy status of the folder.
     * @param {boolean} value New lazy status.
     */
    setLazy(value) {
        this._lazy = value;
    }

    /**
     * Get the loading state of the folder.
     * @returns {boolean} Loading state.
     */
    isLoading() {
        return this._loading;
    }

    /**
     * Set the loading state of the folder.
     * @param {boolean} value New loading state.
     */
    setLoading(value) {
        this._loading = value;
    }

    /**
     * Get the failed state of the folder.
     * @returns {boolean} Failed state.
     */
    isFailed() {
        return this._failed;
    }

    /**
     * Set the failed state of the folder to "true".
     */
    setFailed() {
        this._failed = true;
    }

    /**
     * Get the visibility of the layer.
     * @returns {boolean} Visibility of the layer.
     */
    isVisible() {
        return this._visible;
    }

    /**
     * Set the visibility of the layer.
     * @param {boolean} visible Visibility of the layer.
     */
    setVisible(visible) {
        this._visible = visible;
    }

    /**
     * Set the keywords of the layer.
     * @param {string[]} keywords Keywords of the layer.
     */
    setKeywords(keywords) {
        this._keywords = keywords;
    }

    /**
     * Get the keywords of the layer.
     * @returns {string[]} Keywords of the layer.
     */
    getKeywords() {
        return this._keywords;
    }
}
