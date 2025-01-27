import {html, render, nothing} from 'lit-html';
import {LayerTreeFolder} from "../modules/LayerTree/LayerTreeFolder";
import {WMSCapabilities} from "ol/format";
import {LayerTreeLayer} from "../modules/LayerTree/LayerTreeLayer";

/**
 * Class representing the layer store.
 * @extends HTMLElement
 */
export class LayerStore extends HTMLElement {

  /**
   * Create a layer store.
   * @param {HTMLElement} container The HTMLElement where the layer store will be rendered.
   */
  constructor(container) {
    super();
    this.container = container;
    this.tree = [];

    mapBuilder.layerStoreTree.forEach((value) => {
      this.tree.push(new LayerTreeFolder({
        title: value.title,
        children: value.children,
        lazy: value.lazy,
        project: value.project,
        repository: value.repository,
        bbox: value.bbox,
        popup: value.popup,
        color: value.color
      }));
    });
    this.render()
  }

  /**
   * Template for a folder.
   * @param {LayerTreeFolder} element The folder to render.
   * @returns {TemplateResult<1>} The template of the folder.
   */
  folderTemplate = (element) => {
    //Check if the folder will have to load children from a project.
    let tagLazy = element.isLazy() ? "lazy" : "";

    let icoSpan;

    //Check if the folder is loading, opened or closed.
    if (element.isLoading()) {
      icoSpan = "fa-spinner fa-pulse";
    } else {
      icoSpan = element.isOpened() ? "fa-folder-open" : "fa-folder";
    }

    //Check if the folder is failed to load children.
    //It occurs when the project can't be loaded.
    if (element.isFailed()) {
      icoSpan = "fa-window-close";
      tagLazy = "failed";
    }

    //Template of a folder.
    let template = html`
        <li class='layer-store-arrow ${tagLazy}' @click='${(event) => this.action(element, event)}'>
        <span class='layer-store-folder  fas ${icoSpan}'></span>
        <span class="layer-store-title">${element.getTitle()}</span>
        ${!element.getProject()
                ? html`
                    <div class="layer-store-color" style="background-color: ${element.getColor()}"></div>`
                : nothing
        }
        </li>
    `;

    //Generate next folders or layers.
    if (element.isOpened() && element.hasChildren()) {
      let allChildTemplate = html``;
      element.getChildren().forEach(value => {
        let childTemplate;
        if (value instanceof LayerTreeFolder) {
          childTemplate = html`
              ${this.folderTemplate(value)}
          `;
        } else {
          childTemplate = html`
              ${this.layerTemplate(value)}
          `;
        }
        allChildTemplate = html`
            ${allChildTemplate}
            ${childTemplate}
        `;
      });
      template = html`
          ${template}
          <ul class="layer-store-tree"
              @mouseover='${(event) => {event.target.closest("ul").style = `background-color: ${element.getHoverColor()}; transition: 0.2s;`}}' 
              @mouseout='${(event) => {event.target.closest("ul").style = `background-color: ${element.getColor()}; transition: 0.2s;`}}' 
              style="background-color: ${element.getColor()}">
              ${allChildTemplate}
          </ul>
      `;
    }
    return template;
  }

  /**
   * Template for a layer.
   * @param {LayerTreeLayer} element The layer to render.
   * @returns {TemplateResult<1>} The template of the layer.
   */
  layerTemplate = (element) => {
    var styleOption = html``;
    element.getStyle().forEach(function (style) {
      styleOption = html`
          ${styleOption}
          <option>
              ${style.Name}
          </option>
      `;
    });

    //Check if the layer has a tooltip.
    let tooltip = element.getTooltip() !== undefined ? element.getTooltip() : "";

    //Template
    return html`
        <li class='layer-store-layer fas fa-layer-group' id="${element.getUuid()}"
            @mouseover='${(e) => {e.target.closest("li").style = `background-color: ${element.getColor()}; box-shadow: 0 0 5px 0.5px rgba(0,0,0,0.2); transition: 0.2s;`;}}'
            @mouseout='${(e) => {e.target.closest("li").style = `transition: 0.2s;`;}}'
        >
            <span class="layer-store-title" title=${tooltip}>${element.getTitle()}</span>
            <select class='layerStyles custom-select custom-select-sm'>
                ${styleOption}
            </select>
        </li>
    `;
  }

  //Render the layer store.
  render() {
    const tpl = html`
        <ul class="layer-store-tree">
            ${this.tree.map((el) =>
                    html`
                        ${this.folderTemplate(el)}
                    `
            )}
        </ul>
    `;
    render(tpl, this.container);
  }

  connectedCallback() {
    this.render();
  }

  /**
   * Action when a folder is clicked.
   * It can open or close the folder.
   * It can decide to load the project and put children in the folder.
   * @param {LayerTreeFolder} element The folder clicked.
   * @param {Event} e Event occurring.
   */
  async action(element, e) {
    if (element.isLazy()) {
      element.setLoading(true);
      this.render();
      //Prevent from multiple request
      element.setLazy(false);
      e.target.closest('.lazy').children[0].className = "layer-store-folder fas fa-spinner fa-pulse";
      //After loaded
      let child = await this.loadTree(element);
      element.setLazy(false);
      element.setLoading(false);
      if (child.length > 0) {
        child.forEach((el) => {
          el.repository = element.getRepository();
          el.project = element.getProject();
        });
        element.createChildren(child);
        element.changeStatusFolder();
      } else {
        element.setFailed();
      }
    } else {
      element.changeStatusFolder();
    }
    this.render();

  };

  /**
   * Load the project and create the tree.
   * @param {LayerTreeFolder} folder Folder with specs of the project to load.
   * @returns {Promise<[]>} The children of the folder.
   */
  async loadTree(folder) {
    var repositoryId = folder.getRepository();
    var projectId = folder.getProject();
    var url = lizUrls.wms + "?repository=" + repositoryId + "&project=" + projectId + "&SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0";
    var parser = new WMSCapabilities();

    const promises = [
      new Promise(resolve => {
          $.get(url, function (capabilities) {
            var result = parser.read(capabilities);
            if (result.hasOwnProperty('Capability')) {
              var node = result.Capability;

              if (node.hasOwnProperty('Layer')) {
                // First layer is in fact project
                if (node.Layer.hasOwnProperty('Layer')) {
                  resolve(node.Layer.Layer);
                } else { // Should not happen
                  resolve(node.Layer);
                }
              }
            } else {
              resolve(false);
            }
          }).fail(() => {
            resolve(false);
          });
        }
      ),
      new Promise(resolve =>
        $.getJSON(lizUrls.config, {"repository": repositoryId, "project": projectId}, function (cfgData) {
          if (cfgData) {
            resolve(cfgData);
          } else {
            resolve(false);
          }
        })
      )
    ];
    return await Promise.all(promises).then(results => {
      if (!mapBuilder.hasOwnProperty('lizMap')) {
        mapBuilder.lizMap = {};
      }

      if (results[0] && results[1]) {
        // Cache project config for later use
        mapBuilder.lizMap[repositoryId + '|' + projectId] = {};
        mapBuilder.lizMap[repositoryId + '|' + projectId].config = results[1];

        return this.buildLayerTree(results[0], results[1]);
      } else {
        // Return empty array when errors
        return [];
      }
    });
  }

  /**
   * Build the layer tree.
   * @param layer Layers loaded.
   * @param cfg Configuration of the project.
   * @return {*[]} The tree of layers.
   */
  buildLayerTree(layer, cfg) {
    var myArray = [];
    if (Array.isArray(layer)) {
      layer.forEach((sublayer) => {
        // Layer name is used as a key in lizmap config
        var sublayerName = sublayer.Name;

        // If key is not present, it might because a shortname has been defined in QGIS
        if (!cfg.layers.hasOwnProperty(sublayer.Name)) {
          for (var key in cfg.layers) {
            if (cfg.layers[key].hasOwnProperty('shortname') && (cfg.layers[key].shortname === sublayer.Name)) {
              sublayerName = cfg.layers[key].name;
            }
          }
        }
        // Filter layers in Hidden and Overview directory
        if (sublayer.hasOwnProperty('Title') && (sublayer.Title.toLowerCase() === 'hidden' || sublayer.Title.toLowerCase() === 'overview')) {
          return;
        }
        // Filter layers not visible in legend or without geometry
        if (sublayer.hasOwnProperty('Name') && cfg.layers.hasOwnProperty(sublayerName)
          && (cfg.layers[sublayerName].displayInLegend === 'False' || cfg.layers[sublayerName].geometryType === 'none')) {
          return;
        }
        var layers = this.buildLayerTree(sublayer, cfg);
        myArray = myArray.concat(layers);
      });
      return myArray;
    }

    // Layer name is used as a key in lizmap config
    var layerName = layer.Name;

    // If key is not present, it might because a shortname has been defined in QGIS
    if (!cfg.layers.hasOwnProperty(layer.Name)) {
      for (var key in cfg.layers) {
        if (cfg.layers[key].hasOwnProperty('shortname') && (cfg.layers[key].shortname === layer.Name)) {
          layerName = cfg.layers[key].name;
        }
      }
    }

    // Create node
    if (cfg.layers.hasOwnProperty(layerName)) {
      var myObj = {title: cfg.layers[layerName].title, name: layerName, popup: cfg.layers[layerName].popup};

      if (layer.hasOwnProperty('Style')) {
        myObj.style = layer.Style;
      }
      if (layer.hasOwnProperty('EX_GeographicBoundingBox')) {
        myObj.bbox = layer.EX_GeographicBoundingBox;
      }
      if (layer.hasOwnProperty('MinScaleDenominator') && layer.MinScaleDenominator !== undefined) {
        myObj.minScale = layer.MinScaleDenominator;
      }
      if (layer.hasOwnProperty('MaxScaleDenominator') && layer.MaxScaleDenominator !== undefined) {
        myObj.maxScale = layer.MaxScaleDenominator;
      }
      if (cfg.attributeLayers.hasOwnProperty(layerName)
        && cfg.attributeLayers[layerName].hideLayer !== "True"
        && cfg.attributeLayers[layerName].pivot !== "True") {
        myObj.hasAttributeTable = true;
      }
      if (cfg.layers.hasOwnProperty(layerName)
        && cfg.layers[layerName].abstract !== "") {
        myObj.tooltip = cfg.layers[layerName].abstract;
      }
      myArray.push(myObj);
    }

    // Layer has children and is not a group as layer => folder
    if (layer.hasOwnProperty('Layer') && cfg.layers[layerName].groupAsLayer === 'False') {
      myObj.folder = true;
      myObj.children = this.buildLayerTree(layer.Layer, cfg);
    }
    return myArray;
  }

  /**
   * Get a node (LayerTreeLayer) from a specific UUID.
   * @param {string} uuid UUID of the node.
   * @param {LayerTreeElement} element Element to compare.
   * @returns {LayerTreeLayer|-1} The node or -1 if not found.
   */
  getNode(uuid, element) {
    if (element instanceof LayerTreeLayer) {
      if (element.getUuid() === uuid) {
        return element;
      } else {
        return -1;
      }
    }
    for (var i = 0; i < element.getChildren().length; i++) {
      var result = this.getNode(uuid, element.getChildren()[i]);
      if (result !== -1) {
        return result
      }
    }
    return -1;
  }

  /**
   * Get the tree.
   * @return {[LayerTreeElement]} The tree.
   */
  getTree() {
    return this.tree;
  }
}

customElements.define('lizmap-layer-store', LayerStore);
