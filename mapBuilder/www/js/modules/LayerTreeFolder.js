import {LayerTreeLayer} from "./LayerTreeLayer";
import {LayerTreeElement} from "./LayerTreeElement";

/**
 * @typedef {Object} Options
 * @property {array} [#children] length of the queue.
 * @property {boolean} [#opened] if the folder is opened
 * @property {boolean} [#lazy] lazy load
 * @property {boolean} [#loading] if it's loading
 * @property {boolean} [#failed] failed state
 */
export class LayerTreeFolder extends LayerTreeElement {

  #children;
  #opened;
  #lazy;
  #loading;
  #failed;

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

  changeStatusFolder() {
    this.#opened = !this.#opened;
  }

  isLazy() {
    return !!this.#lazy;
  }

  setLazy(value) {
    this.#lazy = value;
  }

  isLoading() {
    return this.#loading;
  }

  setLoading(value) {
    this.#loading = value;
  }

  getChildren() {
    return this.#children;
  }

  hasChildren() {
    return this.#children.length !== 0;
  }

  isOpened() {
    return this.#opened;
  }

  isFailed() {
    return this.#failed;
  }

  setFailed() {
    this.#failed = true;
  }
}