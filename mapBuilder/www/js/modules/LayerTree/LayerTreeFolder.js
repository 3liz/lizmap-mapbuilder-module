import {LayerTreeLayer} from "./LayerTreeLayer";
import {LayerTreeElement} from "./LayerTreeElement";

/**
 * Class representing a folder in a Layer Tree.
 @property {Array} _children Queue length.
 @property {boolean} _opened If the folder is opened or not for the visual part.
 @property {boolean} _lazy If the folder will have to load children from a project.
 @property {boolean} _loading Loading state of the folder.
 @property {boolean} _failed If the folder got a load error.
 */
export class LayerTreeFolder extends LayerTreeElement {
    /**
     * Create a folder in a tree.
     * @param {object} options LayerTreeFolder options.
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

        this._children = [];

        if (options.children) {
            for (let i = 0; i < options.children.length; i++) {
                this._children.push(options.children[i]);
            }
        }

        this._opened = false;

        this._lazy = options.lazy !== undefined ? options.lazy : undefined;

        this._loading = false;

        if (this._children.length > 0) {
            this.createChildren();
        }

        this._failed = false;
    }

    /**
     * Create children of the folder.
     * Use children of the object if no children are given.
     * This function can be used when children are loaded from
     * a project, so they can be passed to the "children" param.
     * @param {[]} children Children of the folder.
     */
    createChildren(children = undefined) {
        let list = [];

        let listChild = children !== undefined ? children : this._children;

        listChild.forEach((value) => {
            value.color = this.getColor();
            if (value.hasOwnProperty("style")) {
                value.repository = this.getRepository();
                value.project = this.getProject();

                list.push(new LayerTreeLayer({
                    bbox: value.bbox,
                    attributeTable: value.hasAttributeTable,
                    name: value.name,
                    popup: value.popup,
                    style: value.style,
                    title: value.title,
                    tooltip: value.tooltip,
                    project: value.project,
                    repository: value.repository,
                    color: value.color,
                }));
            } else {
                list.push(new LayerTreeFolder({
                    title: value.title,
                    children: value.children,
                    lazy: value.lazy,
                    project: value.project,
                    repository: value.repository,
                    bbox: value.bbox,
                    popup: value.popup,
                    color: value.color
                }));
            }
        });
        this._children = list;
    }

    /**
     * Change the status of the folder.
     * Open if closed, close if opened.
     */
    changeStatusFolder() {
        this._opened = !this._opened;
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
     * Get the children of the folder.
     * @returns {[LayerTreeElement]} Children.
     */
    getChildren() {
        return this._children;
    }

    /**
     * Know if the folder has children.
     * @returns {boolean} If the folder has children.
     */
    hasChildren() {
        return this._children.length !== 0;
    }

    /**
     * Know if the folder is opened.
     * @returns {boolean} If the folder is opened.
     */
    isOpened() {
        return this._opened;
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
}
