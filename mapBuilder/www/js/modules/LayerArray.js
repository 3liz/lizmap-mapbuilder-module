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
   * @param {[ImageLayer]} [array] Array made of ImageLayer.
   */
  setArray(array) {
    if (array.length > 1) {
      this.#elements.push(new LayerElement({
        layer: array[1],
        uid: array[1].ol_uid
      }));
    }
  }

  /**
   * @param {ImageLayer} [layer] layer
   */
  addElement(layer) {
    let element = new LayerElement({
      layer: layer,
      uid: layer.ol_uid
    });
    if (this.#elements.length === 0) {
      this.#elements.push(element);
    } else {
      this.addWithOrder(element, 0);
    }
    return element;
  }

  /**
   * @param {LayerElement} [el] element
   * @param {number} [index] index
   */
  addWithOrder(el, index) {
    if (this.#elements[index].getLayer().getZIndex() < el.getLayer().getZIndex()) {
      return this.#elements.splice(index, 0, el);
    }
    if (this.#elements.length > index + 1) {
      return this.addWithOrder(el, index + 1);
    } else {
      return this.#elements.splice(index + 1, 0, el);
    }
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

    //On the LayerElement
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
  }

  /**
   * @returns {[LayerElement]}
   */
  getArray() {
    return this.#elements;
  }

}