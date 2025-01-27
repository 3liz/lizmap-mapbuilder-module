import {LayerArray} from "./LayerArray";
import {LayerSelected} from "../../components/LayerSelected";

/*****************************************************
 * Script created to manage the selection of layers. *
 *****************************************************/

/**
 * @type {LayerArray} List of selected layers.
 */
let layerArray = new LayerArray();

/**
 * Add a layer to the list of selected layers.
 * Create also Listener for drag and drop.
 * @param {ImageLayer} value Layer to add.
 * @param {string} color Layer's color.
 */
export function addElementToLayerArray(value, color) {
  let layerSelected = new LayerSelected(layerArray.addElement(value, color));

  document.getElementById("layer-selected-holder").insertBefore(
    layerSelected,
    document.getElementById("layer-selected-holder").children[0]
  );

  layerSelected.addEventListener('dragstart', function(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.target.classList.add('dragging');
  });

  layerSelected.addEventListener('dragend', function(e) {
    e.target.classList.remove('dragging');
  });

  const dropZone = document.getElementById('layer-selected-holder');

  dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
  });

  dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(data);

    let index = getIndexOfDrop(dropZone, e.clientY);

    while (layerArray.getIndexOf(draggedElement.id) !== index) {
      let currentIndex = layerArray.getIndexOf(draggedElement.id);
      if (currentIndex > index) {
        changeList(draggedElement.id, "up");
      } else {
        changeList(draggedElement.id, "down");
      }
    }
  });
}

/**
 * Used to get the index of the layer where the user dropped the dragged layer.
 * @param {HTMLElement} layers Represents the "layer-selected-holder" div.
 * @param {number} y Y coordinate of the drop.
 * @return {number} Index of the drop.
 */
function getIndexOfDrop(layers, y) {
  if (layers.children.length <= 1) {
    return 0;
  }
  for (let i = 0; i < layers.children.length-1; i++) {
    if (layers.children[i].getBoundingClientRect().y <= y &&
        y < layers.children[i+1].getBoundingClientRect().y) {
      return i;
    }
  }
  return layers.children.length-1;
}

/**
 * Get the object àf selected layers.
 * @returns {LayerArray} Object of selected layers.
 */
export function getLayerSelectionArray() {
  return layerArray
}

/**
 * Change the order of the layers with a direction.
 * @param {string} uid Layer's uid.
 * @param {string} direction Which direction to go : 'up' or 'down'.
 */
export function changeList(uid, direction) {
  if (direction === "up") {
    changeOrderUp(uid);
  } else {
    changeOrderDown(uid);
  }
}

/**
 * Change the order of the layer with the one above.
 * @param {String} uid layer's uid
 */
function changeOrderUp(uid) {
  layerArray.changeOrder(uid, "up");
  let element = document.getElementById(`${uid}`);
  switchVisualLayers(
    element,
    element.previousElementSibling
  );
}

/**
 * Change the order of the layer with the one below.
 * @param {String} uid layer's uid
 */
function changeOrderDown(uid) {
  layerArray.changeOrder(uid, "down");
  let element = document.getElementById(`${uid}`);
  switchVisualLayers(
    element,
    element.nextElementSibling
  );
}

/**
 * Switch the HTMLElements in the DOM.
 * @param {HTMLElement} firstEl First element to switch.
 * @param {HTMLElement} secondEl Second element to switch.
 */
function switchVisualLayers(firstEl, secondEl) {
  let list = Array.from(document.querySelectorAll("lizmap-layer-selected"));

  let indexFirst = list.indexOf(firstEl);
  let indexSecond = list.indexOf(secondEl);

  let tmp = list[indexFirst];
  list[indexFirst] = list[indexSecond];
  list[indexSecond] = tmp;

  let parent = list[0].parentNode;
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }

  list.forEach(function(element) {
    parent.appendChild(element);
  });
}
