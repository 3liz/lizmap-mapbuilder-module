import {html, render} from 'lit-html';
import {LayerTreeFolder} from "../modules/LayerTreeFolder";
import {WMSCapabilities} from "ol/format";
import {LayerTreeLayer} from "../modules/LayerTreeLayer";

export class LayerStore extends HTMLElement {

  constructor(container) {
    super();
    this.container = container;
    this._tree = [];
  }

  set tree(value) {
    this._tree = value;
    this.render()
  }

  /**
   * @param {LayerTreeFolder} element
   */
  folderTemplate = (element) => {
    let icoLi;
    let tagLazy = element.isLazy() ? "lazy" : "";

    let icoSpan;

    if (element.isLoading()) {
      icoSpan = "fa-spinner fa-pulse";
    } else {
      icoSpan = element.isOpened() ? "fa-folder-open" : "fa-folder";
    }

    if (element.isOpened()) {
      icoLi = "fa-caret-down";
    } else {
      icoLi = element.isLazy() ? "fa-angle-right" : "fa-caret-right";
    }

    if (element.isFailed()) {
      icoLi = "";
      icoSpan = "fa-window-close";
    }

    let template = html`
        <li class='layerStore-arrow ${tagLazy} fas ${icoLi}' @click='${(event) => this.action(element, event)}'>
            <span class='layerStore-folder  fas ${icoSpan}'></span> ${element.getTitle()}
        </li>
    `;

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
          <ul class="layerStore-tree">
              ${allChildTemplate}
          </ul>
      `;
    }
    return template;
  }

  /**
   * @param {LayerTreeLayer} element
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

    let tooltip = element.getTooltip() !== undefined ? element.getTooltip() : "";

    return html`
        <li class='layerStore-layer fas fa-globe-africa'>
            <span title=${tooltip}>${element.getTitle()}</span>
            <select class='layerStyles custom-select custom-select-sm'>
                ${styleOption}
            </select>
            <button id=${element.getUuid()} type='button' class='addLayerButton btn btn-sm'>
                <i class='fas fa-plus'></i>
            </button>
        </li>
    `;
  }

  render() {
    const tpl = html`
        <ul class="layerStore-tree">
            ${this._tree.map((el) =>
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

  async action(element, e) {
    if (element.isLazy()) {
      element.setLoading(true);
      this.render();
      //Prevent from multiple request
      element.setLazy(false);
      e.target.closest('.lazy').children[0].className = "layerStore-folder fas fa-spinner fa-pulse";
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
   * @param {LayerTreeFolder} folder
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
}

customElements.define('lizmap-layer-store', LayerStore);