import {html, render} from 'lit-html';
import {transformExtent} from "ol/proj";
import {Slider} from "./Slider";
import {getLayerSelectionArray, changeList} from "../modules/LayerSelection.js";
import {AttributeTable} from "./AttributeTable";

export class LayerSelected extends HTMLElement {
  /**
   * @type {LayerElement}
   */
  #element;

  /**
   * @param {LayerElement} element
   */
  constructor(element) {
    super();
    this.#element = element;
    this.setAttribute("class", "containerLayerSelected");
    this.setAttribute("id", element.getUid());
    this.setAttribute("draggable", "true");
    this.render()
  }

  render() {
    let layerShow = this.#element.getLayer().isVisible() ? "fa-eye" : "fa-eye-slash active";
    let infoShow = this.#element.isInfoVisible() ? "fa-info active" : "fa-info";
    let attributeTableShow;
    let info;

    if (this.#element.getLayer().getProperties().hasAttributeTable) {
      attributeTableShow = this.#element.isAttributeTableOpened() ? html`
          <button class="dispayDataButton fas fa-list-ul active" @click="${(event) => this.actionDisplayDataButton(event, this.#element)}" disabled></button>` : html`
          <button class="dispayDataButton fas fa-list-ul" @click="${(event) => this.actionDisplayDataButton(event, this.#element)}"></button>`
    }

    if (this.#element.isInfoVisible()) {

      let sliderWidth = this.getWidthFromCssRule("custom-slider .slider");

      let slider = new Slider(`
        background-color: ${this.#element.getColor()};
        left: ${Math.floor(((this.#element.getLayer().getOpacity() * 100) * (sliderWidth - 10)) / 100) + 'px'};
        `,
        this.#element.getLayer()
      );

      info = html`
          <div class="midLine">
              <span class="layerStyleSpan">${this.#element.getLayer().getSource().getParams()["STYLES"]}</span>
              ${slider}
          </div>`;
    }

    let tpl = html`
        <div class="changeOrderContainer" style="background-color: ${this.#element.getColor()}">
            <div class="changeOrder changeOrderUp" style="background-color: ${this.#element.getColor()}"
                 @click="${() => changeList(this.#element.getUid(), "up")}"
                 @mouseover='${(e) => this.actionMouseOver(e)}'
                 @mouseout='${(e) => this.actionMouseOut(e)}'
            >
                <i class="fas fa-caret-up"></i>
            </div>
            <div class="changeOrder changeOrderDown" style="background-color: ${this.#element.getColor()}"
                 @click="${() => changeList(this.#element.getUid(), "down")}"
                 @mouseover='${(e) => this.actionMouseOver(e)}'
                 @mouseout='${(e) => this.actionMouseOut(e)}'
            >
                <i class="fas fa-caret-down"></i>
            </div>
        </div>
        <div class="layerSelectedContent">
            <div class="upperLine">
                <span class="titleLayerSelected">${this.#element.getLayer().getProperties().title}</span>
                <div class="layerButtonsDiv">
                    ${attributeTableShow}
                    <button class="zoomToExtentButton fas fa-search-plus"
                            @click="${(event) => this.actionZoomToExtentButton(event)}"></button>
                    <button class="toggleVisibilityButton fas ${layerShow}"
                            @click="${(event) => this.actionToggleVisibilityButton(event)}"></button>
                    <button class="toggleInfos fas ${infoShow}"
                            @click="${(event) => this.actionToggleInfos(event)}"></button>
                </div>
            </div>
            ${info}
            <button class="deleteLayerButton" @click="${(event) => this.actionDeleteLayerButton(event)}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    render(tpl, this);
  }

  /**
   * @param {PointerEvent} event event occurring
   */
  actionDeleteLayerButton(event) {
    getLayerSelectionArray().removeElement(event.target.closest(".containerLayerSelected").id);
    document.getElementById("layerSelectedHolder").removeChild(this);
  }

  /**
   * @param {PointerEvent} event event occurring
   */
  actionToggleVisibilityButton(event) {
    this.#element.switchVisibility();
    this.render()
  }

  /**
   * @param {PointerEvent} event event occurring
   */
  actionZoomToExtentButton(event) {
    mapBuilder.map.getView().fit(transformExtent(this.#element.getLayer().getProperties().bbox, 'EPSG:4326', mapBuilder.map.getView().getProjection()));
  }

  /**
   * @param {PointerEvent} event event occurring
   */
  actionToggleInfos(event) {
    this.#element.switchInfoVisibility();
    this.render();
  }

  /**
   * @param {string} rule css rule
   * @return {number} width rule
   */
  getWidthFromCssRule(rule) {
    let cssText = "";
    let classes = document.styleSheets[3].cssRules;
    for (var x = 0; x < classes.length; x++) {
      if (classes[x].selectorText === rule) {
        cssText += classes[x].style["width"];
      }
    }
    return parseInt(cssText.split("px")[0]);
  }

  actionMouseOver(e) {
    e.target.closest("div.changeOrder").style = `background-color: ${this.#element.getHoverColor()}; transition: 0.2s;`
  }

  actionMouseOut(e) {
    e.target.closest("div.changeOrder").style = `background-color: ${this.#element.getColor()}; transition: 0.2s;`
  }

  performCleanName(aName) {
    var accentMap = {
      "à": "a",
      "á": "a",
      "â": "a",
      "ã": "a",
      "ä": "a",
      "ç": "c",
      "è": "e",
      "é": "e",
      "ê": "e",
      "ë": "e",
      "ì": "i",
      "í": "i",
      "î": "i",
      "ï": "i",
      "ñ": "n",
      "ò": "o",
      "ó": "o",
      "ô": "o",
      "õ": "o",
      "ö": "o",
      "ù": "u",
      "ú": "u",
      "û": "u",
      "ü": "u",
      "ý": "y",
      "ÿ": "y",
      "À": "A",
      "Á": "A",
      "Â": "A",
      "Ã": "A",
      "Ä": "A",
      "Ç": "C",
      "È": "E",
      "É": "E",
      "Ê": "E",
      "Ë": "E",
      "Ì": "I",
      "Í": "I",
      "Î": "I",
      "Ï": "I",
      "Ñ": "N",
      "Ò": "O",
      "Ó": "O",
      "Ô": "O",
      "Õ": "O",
      "Ö": "O",
      "Ù": "U",
      "Ú": "U",
      "Û": "U",
      "Ü": "U",
      "Ý": "Y",
      "-": " ",
      "'": " ",
      "(": " ",
      ")": " "
    };
    var normalize = function (term) {
      var ret = "";
      for (var i = 0; i < term.length; i++) {
        ret += accentMap[term.charAt(i)] || term.charAt(i);
      }
      return ret;
    };
    var theCleanName = normalize(aName);
    var reg = new RegExp('\\W', 'g');
    return theCleanName.replace(reg, '_');
  }

  actionDisplayDataButton(e, element) {
    document.getElementById("attribute-btn").classList.add("active");

    var idLayer = e.target.closest(".containerLayerSelected").id;
    var layer;
    var layerElement;

    for (var i = 0; i < getLayerSelectionArray().getArray().length; i++) {
      if (getLayerSelectionArray().getArray()[i].getLayer().ol_uid === idLayer) {
        layer = getLayerSelectionArray().getArray()[i].getLayer();
        layerElement = getLayerSelectionArray().getArray()[i];
        break;
      }
    }

    element.setAttributeTableVisibility(true);
    this.render();

    var layerName = this.performCleanName(layer.getSource().getParams()["LAYERS"]);
    var repositoryId = layer.getProperties().repositoryId;
    var projectId = layer.getProperties().projectId;

    const promises = [
      new Promise(resolve => {
        fetch(`${lizUrls.wms}?repository=${repositoryId}&project=${projectId}&SERVICE=WFS&REQUEST=GetFeature&VERSION=1.0.0&TYPENAME=${layerName}&OUTPUTFORMAT=GeoJSON&GEOMETRYNAME=extent`)
          .then(response => response.json())
          .then(features => resolve(features))
          .catch(error => console.error('Error fetch: ', error));
      }),
      new Promise(resolve => {
        fetch(`${lizUrls.wms}?repository=${repositoryId}&project=${projectId}&SERVICE=WFS&VERSION=1.0.0&REQUEST=DescribeFeatureType&TYPENAME=${layerName}&OUTPUTFORMAT=JSON`)
          .then(response => response.json())
          .then(describe => resolve(describe))
          .catch(error => console.error('Error fetch: ', error));
      })
    ];

    Promise.all(promises).then(results => {
      // TODO : cache results
      var features = results[0].features;
      var aliases = results[1].aliases;

      // Show only WFS-published and non hidden properties
      var propertiesFromWFS = features[0].properties;
      var visibleProperties = [];

      if (mapBuilder.lizMap[repositoryId + '|' + projectId].config.attributeLayers[layer.getSource().getParams()["LAYERS"]].hasOwnProperty('attributetableconfig')) {
        var columns = mapBuilder.lizMap[repositoryId + '|' + projectId].config.attributeLayers[layer.getSource().getParams()["LAYERS"]].attributetableconfig.columns.column;
      }

      if (columns !== undefined) {
        for (var i = 0; i < columns.length; i++) {
          if (propertiesFromWFS.hasOwnProperty(columns[i].attributes.name) && columns[i].attributes.hidden === "0") {
            visibleProperties.push(columns[i].attributes.name);
          }
        }
      } else {
        for (var property in propertiesFromWFS) {
          visibleProperties.push(property);
        }
      }

      var elements = [repositoryId, projectId, layerName, features, aliases, visibleProperties];

      // Hide other tabs before appending
      var navLinks = document.querySelectorAll('#attributeLayersTabs .nav-link');

      navLinks.forEach(function (navLink) {
        navLink.classList.remove('active');
      });

      var tabPane = document.querySelectorAll('#attributeLayersContent .tab-pane');

      tabPane.forEach(function (tabPane) {
        tabPane.classList.remove('show');
        tabPane.classList.remove('active');
      });

      document.getElementById("attributeLayersTabs").insertAdjacentHTML("beforeend", '\
          <li class="nav-item">\
            <a class="nav-link active" href="#attributeLayer-' + repositoryId + '-' + projectId + '-' + layerName + '" role="tab">' + layer.getProperties().title + '&nbsp;<i data-ol_uid="' + layer.ol_uid + '" class="fas fa-times"></i></a>\
          </li>'
      );

      const container = document.getElementById('attributeLayersContent');

      const addToContainer = (elements) => {
        const attributeTable = new AttributeTable(elements);
        container.appendChild(attributeTable);
        attributeTable.updateContent();
      };

      if (document.getElementById("attributeLayersContent").innerHTML === "") {
        const attributeTable = new AttributeTable(elements);
        container.appendChild(attributeTable);
        attributeTable.updateContent();
      } else {
        addToContainer(elements);
      }

      // Handle tab click events
      document.querySelectorAll('#attributeLayersTabs a').forEach(function(tab) {
        tab.addEventListener('click', function(e) {
          e.preventDefault();
          var tabElement = new bootstrap.Tab(this);
          tabElement.show();
        });
      });

      // Handle close tabs
      document.querySelectorAll('#attributeLayersTabs .fa-times').forEach((closeIcon) => {
        closeIcon.addEventListener('click', (e) => {
          e.preventDefault();
          if (e.target.dataset.ol_uid === layerElement.getLayer().ol_uid) {
            var isActiveTab = e.target.closest('a').classList.contains('active');
            var closestLi = e.target.closest('a').closest('li');
            var previousTab = closestLi.previousElementSibling;
            var nextTab = closestLi.nextElementSibling;

            // Remove tab and its content
            var parentId = e.target.closest('a').getAttribute('href');
            document.querySelector(parentId).remove();
            closestLi.remove();

            this.#element.setAttributeTableVisibility(false);
            this.render();

            // Hide bottom dock
            if (document.getElementById("attributeLayersContent").textContent.trim() === "") {
              document.getElementById("bottom-dock").style.display = 'none';
              document.getElementById("attribute-btn").classList.remove("active");
            }

            // Activate another sibling tab if current was active
            if (isActiveTab) {
              if (nextTab) {
                var nextLink = nextTab.querySelector('.nav-link');
                var nextTabElement = new bootstrap.Tab(nextLink);
                nextTabElement.show();
              } else if (previousTab) {
                var prevLink = previousTab.querySelector('.nav-link');
                var prevTabElement = new bootstrap.Tab(prevLink);
                prevTabElement.show();
              }
            }
          }
        });
      });

      // Handle zoom to feature extent
      document.querySelectorAll(".zoomToFeatureExtent").forEach(function(element) {
        element.addEventListener('click', function () {
          var bbox = JSON.parse(this.getAttribute('data-feature-extent'));
          mapBuilder.map.getView().fit(transformExtent(bbox, 'EPSG:4326', mapBuilder.map.getView().getProjection()));
        });
      });

      document.getElementById("bottom-dock").style.display = 'block';
    });
  }
}

customElements.define('lizmap-layer-selected', LayerSelected);