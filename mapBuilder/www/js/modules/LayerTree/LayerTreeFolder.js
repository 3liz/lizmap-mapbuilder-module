import {LayerTreeLayer} from "./LayerTreeLayer";
import {LayerTreeElement} from "./LayerTreeElement";

/** Class representing a folder in a Layer Tree. */
export class LayerTreeFolder extends LayerTreeElement {

  /**
   * @type {[LayerTreeElement]} LayerTreeElement inside of it.
   */
  #children;
  /**
   * @type {boolean} If the folder is opened or not for the visual part.
   */
  #opened;
  /**
   * @type {boolean} If the folder will have to load children from a project.
   */
  #lazy;
  /**
   * @type {boolean} Loading state of the folder.
   */
  #loading;
  /**
   * @type {boolean} If the folder got a load error.
   */
  #failed;

  /**
   * @typedef {Object} Options
   * @property {array} [#children] Queue length.
   * @property {boolean} [#opened] If the folder is opened or not for the visual part.
   * @property {boolean} [#lazy] If the folder will have to load children from a project.
   * @property {boolean} [#loading] Loading state of the folder.
   * @property {boolean} [#failed] If the folder got a load error.
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

    this.#children = [];

    if (options.children) {
      for (let i = 0; i < options.children.length; i++) {
        this.#children.push(options.children[i]);
      }
    }

    this.#opened = false;

    this.#lazy = options.lazy !== undefined ? options.lazy : undefined;

    this.#loading = false;

    if (this.#children.length > 0) {
      this.createChildren();
    }

    this.#failed = false;
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

    let listChild = children !== undefined ? children : this.#children;

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
    this.#children = list;
  }

  /**
   * Change the status of the folder.
   * Open if closed, close if opened.
   */
  changeStatusFolder() {
    this.#opened = !this.#opened;
  }

  /**
   * Get the status of the folder.
   * @return {boolean} Status of the folder.
   */
  isLazy() {
    return !!this.#lazy;
  }

  /**
   * Set the lazy status of the folder.
   * @param {boolean} value New lazy status.
   */
  setLazy(value) {
    this.#lazy = value;
  }

  /**
   * Get the loading state of the folder.
   * @return {boolean} Loading state.
   */
  isLoading() {
    return this.#loading;
  }

  /**
   * Set the loading state of the folder.
   * @param {boolean} value New loading state.
   */
  setLoading(value) {
    this.#loading = value;
  }

  /**
   * Get the children of the folder.
   * @return {[LayerTreeElement]} Children.
   */
  getChildren() {
    return this.#children;
  }

  /**
   * Know if the folder has children.
   * @return {boolean} If the folder has children.
   */
  hasChildren() {
    return this.#children.length !== 0;
  }

  /**
   * Know if the folder is opened.
   * @return {boolean} If the folder is opened.
   */
  isOpened() {
    return this.#opened;
  }

  /**
   * Get the failed state of the folder.
   * @return {boolean} Failed state.
   */
  isFailed() {
    return this.#failed;
  }

  /**
   * Set the failed state of the folder to "true".
   */
  setFailed() {
    this.#failed = true;
  }
}