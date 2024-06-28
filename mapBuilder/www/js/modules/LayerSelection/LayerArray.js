import {Image as ImageLayer} from 'ol/layer.js';
import {LayerElement} from "./LayerElement";

/** Class representing a stack to store selected layers. */
export class LayerArray {
  /**
   * @type {[LayerElement]} Array of selected layers. It's made of LayerElement.
   */
  #elements;

  constructor() {
    this.#elements = [];
  }

  /**
   * Add a LayerElement at the top of the stack.
   * @param {ImageLayer} [layer] Layer to add.
   * @param {string} [color] Color of the layer.
   * @returns {LayerElement} The added LayerElement.
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
   * Change the order of the layers.
   * @param {string} [layerUid] Layer's UID.
   * @param {string} [direction] Which direction to exchange : 'up' or 'down'.
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
   * Remove a LayerElement from the stack.
   * Can also remove it from the map.
   * @param {string} [layerUid] Layer's UID.
   * @param {boolean} [all=true] If all = true, the method remove also the layer on the map.
   * @returns {LayerElement} The removed LayerElement.
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
   * Get the index of a LayerElement in the stack depending on the layer's UID.
   * @param {string} [layerUid] Layer's UID.
   * @returns {number} Index of the LayerElement in the stack.
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
   * Get the array.
   * @returns {[LayerElement]} Array of LayerElement.
   */
  getArray() {
    return this.#elements;
  }

}