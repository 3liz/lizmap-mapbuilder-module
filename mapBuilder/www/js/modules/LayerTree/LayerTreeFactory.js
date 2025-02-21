import {LayerTreeLayer} from "./LayerTreeLayer";
import {LayerTreeFolder} from "./LayerTreeFolder";
import {LayerTreeProject} from "./LayerTreeProject";

/**
 * A factory class for creating different types of Layer Tree elements such as layers, folders, and projects.
 * We need this class as the LayerTreeProject create some LayerTreeFolder ones. So in order to prevent errors
 * like "can't access lexical declaration 'LayerTreeFolder' before initialization", we need to lazy load this
 * class.
 */
export class LayerTreeFactory {
  static createLayerTreeElement(value, layerTreeFolder) {
    value.color = layerTreeFolder.getColor();

    if (value.hasOwnProperty("style")) {
      value.repository = layerTreeFolder.getRepository();
      value.project = layerTreeFolder.getProject();

      return new LayerTreeLayer({
        bbox: value.bbox,
        attributeTable: value.hasAttributeTable,
        name: value.name,
        popup: value.popup,
        style: value.style,
        title: value.title,
        tooltip: value.tooltip,
        project: value.project,
        projectName: layerTreeFolder.getProjectName(),
        repository: value.repository,
        color: value.color,
      });
    } else if (value.lazy) {
      return new LayerTreeProject({
        title: value.title,
        children: value.children,
        lazy: value.lazy,
        project: value.project,
        repository: value.repository,
        bbox: value.bbox,
        popup: value.popup,
        color: value.color
      });
    } else {
      return new LayerTreeFolder({
        title: value.title,
        children: value.children,
        project: value.project,
        projectName: layerTreeFolder.getProjectName(),
        repository: value.repository,
        bbox: value.bbox,
        popup: value.popup,
        color: value.color
      });
    }
  }
}
