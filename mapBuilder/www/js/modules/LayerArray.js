import {Image as ImageLayer} from 'ol/layer.js';
import {LayerElement} from "./LayerElement";

/**
 * @property {[LayerElement]} [#elements] Array made of LayerElement.
 */
export class LayerArray {
  #elements;

  constructor() {
    this.#elements = [];
  }

  /**
   * @param {ImageLayer} [layer] layer
   * @param {string} [color] color
   * @returns {LayerElement}
   */
  addElement(layer, color) {
    let element = new LayerElement({
      layer: layer,
      uid: layer.ol_uid,
      color: color
    });
    this.#elements.unshift(element);
    return element;
  }

  /**
   * @param {string} [layerUid] layer
   * @param {string} [direction] direction up or down
   */
  changeOrder(layerUid, direction) {
    let util;

    if (direction === "up") {
      util = -1;
    } else if (direction === "down") {
      util = 1;
    } else {
      throw new Error(`"direction" is incorrect !`);
    }

    let list = this.#elements;
    let indexFirst = this.getIndexOf(layerUid);
    let indexSecond = indexFirst + util;
    let zIndexFirst = list[indexFirst].getLayer().getZIndex();
    let zIndexSecond = list[indexSecond].getLayer().getZIndex();

    list[indexFirst].getLayer().setZIndex(zIndexSecond);
    list[indexSecond].getLayer().setZIndex(zIndexFirst);

    this.#elements.splice(this.getIndexOf(layerUid) + util, 0, this.removeElement(layerUid, false));
  }

  /**
   * @param {string} [layerUid] layer
   * @param {boolean} [all=true] if the method remove also in mapBuilder.map.AllLayers...
   */
  removeElement(layerUid, all = true) {
    let index = this.getIndexOf(layerUid);
    let element = this.#elements[index];

    if (all) {
      mapBuilder.map.removeLayer(this.#elements[index].getLayer());
    }
    this.#elements.splice(index, 1);

    return element
  }

  /**
   * @param {string} [layerUid] layerUid
   */
  getIndexOf(layerUid) {
    for (let i = 0; i < this.#elements.length; i++) {
      if (this.#elements[i].getUid() === layerUid) {
        return i;
      }
    }
    return -1;
  }

  /**
   * @returns {[LayerElement]}
   */
  getArray() {
    return this.#elements;
  }

}