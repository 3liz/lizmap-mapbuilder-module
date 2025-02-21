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

        if (this._children.length > 0) {
            this.createChildren();
        }
    }

    /**
     * Create children of the folder.
     * Use children of the object if no children are given.
     * This function can be used when children are loaded from
     * a project, so they can be passed to the "children" param.
     * @param {[]} children Children of the folder.
     * TODO : update doc
     */
    createChildren(children = undefined) {
        let list = [];

        let listChild = children !== undefined ? children : this._children;

        listChild.forEach((value) => {
            const {LayerTreeFactory} = require('./LayerTreeFactory');

            list.push(LayerTreeFactory.createLayerTreeElement(value, this));
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
}
