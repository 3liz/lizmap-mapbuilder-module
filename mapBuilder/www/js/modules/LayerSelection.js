import {LayerArray} from "./LayerArray";
import {LayerSelected} from "../components/LayerSelected";
import {AttributeTable} from "../components/AttributeTable";

let layerArray = new LayerArray();

export function addElementToLayerArray(value, color) {
  let layerSelected = new LayerSelected(layerArray.addElement(value, color));
  document.getElementById("layerSelectedHolder").insertBefore(
    layerSelected,
    document.getElementById("layerSelectedHolder").children[0]
  );

  layerSelected.addEventListener('dragstart', function(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.target.classList.add('dragging');
  });

  layerSelected.addEventListener('dragend', function(e) {
    e.target.classList.remove('dragging');
  });

  const dropZone = document.getElementById('layerSelectedHolder');

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
 * @returns {LayerArray}
 */
export function getLayerSelectionArray() {
  return layerArray
}

export function changeList(uid, direction) {
  if (direction === "up") {
    changeOrderUp(uid);
  } else {
    changeOrderDown(uid);
  }
}

/**
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