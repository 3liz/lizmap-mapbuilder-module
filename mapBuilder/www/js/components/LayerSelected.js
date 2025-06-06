import {html, render} from 'lit-html';
import {transformExtent} from "ol/proj";
import {Slider} from "./LayerSelection/Slider";
import {getLayerSelectionArray, changeList} from "../modules/LayerSelection/LayerSelection.js";
import {AttributeTable} from "./AttributeTable";

/**
 * Class representing the visual component of a layer selected.
 * @typedef {object} LayerElement
 * @typedef {object} PointerEvent
 * @augments HTMLElement
 * @property {LayerElement} _element Layer associated to the component.
 */
export class LayerSelected extends HTMLElement {
    /**
     * Create a layer selected component.
     * @param {LayerElement} element Layer associated to the component.
     */
    constructor(element) {
        super();
        this._element = element;
        this.setAttribute("class", "container-layer-selected");
        this.setAttribute("id", "layer_" + element.getUid());
        this.setAttribute("draggable", "true");
        this.setAttribute("data-ol-uid", element.getUid());
        this.isCSSProjectNameSet = false;
        this.render()
    }

    /**
     * Render the component.
     */
    render() {
    //Check if the layer is visible or not on the map to adjust the component
        let layerShow = this._element.getLayer().isVisible() ? "fa-eye" : "fa-eye-slash active";

        //Check if the info panel is visible or not to adjust the button in the component
        let infoShow = this._element.isInfoVisible() ? "fa-info active" : "fa-info";

        let attributeTableShow;
        let info;

        //Check if the layer has an attribute table to adjust the component
        if (this._element.getLayer().getProperties().hasAttributeTable) {
            //Check if the attribute table is visible or not to adjust the component
            attributeTableShow = this._element.isAttributeTableOpened() ? html`
          <button class="displayDataButton fas fa-list-ul fa-sm active" @click="${(event) => this.actionDisplayDataButton(event, this._element)}" disabled></button>` : html`
          <button class="displayDataButton fas fa-list-ul fa-sm" @click="${(event) => this.actionDisplayDataButton(event, this._element)}"></button>`
        }

        //Check if the info panel is visible or not to adjust the component
        if (this._element.isInfoVisible()) {

            let sliderWidth = this.getWidthFromCssRule("custom-slider .slider");

            let slider = new Slider(`
        background-color: ${this._element.getColor()};
        left: ${Math.floor(((this._element.getLayer().getOpacity() * 100) * (sliderWidth - 10)) / 100) + 'px'};
        `,
            this._element.getLayer()
            );

            info = html`
          <div class="mid-line">
              <span class="layerStyleSpan">${this._element.getLayer().getSource().getParams()["STYLES"]}</span>
              ${slider}
          </div>`;
        }

        //Template of the component
        let tpl = html`
        <div class="change-order-container" style="background-color: ${this._element.getColor()}">
            <div class="change-order change-order-up" style="background-color: ${this._element.getColor()}"
                 @click="${() => changeList(this._element.getUid(), "up")}"
                 @mouseover='${(e) => this.actionMouseOver(e)}'
                 @mouseout='${(e) => this.actionMouseOut(e)}'
            >
                <i class="fas fa-caret-up"></i>
            </div>
            <div class="change-order change-order-down" style="background-color: ${this._element.getColor()}"
                 @click="${() => changeList(this._element.getUid(), "down")}"
                 @mouseover='${(e) => this.actionMouseOver(e)}'
                 @mouseout='${(e) => this.actionMouseOut(e)}'
            >
                <i class="fas fa-caret-down"></i>
            </div>
        </div>
        <div class="layer-selected-content">
            <div class="upper-line">
                <div class="info-layer-selected">
                    <span class="title-layer-selected">${this._element.getLayer().getProperties().title}</span>
                    <span class="repository-layer-selected">${this._element.getLayer().getProperties().projectName}</span>
                </div>
                <div class="layer-buttons-div">
                    ${attributeTableShow}
                    <button class="zoomToExtentButton fas fa-search-plus fa-sm"
                            @click="${() => this.actionZoomToExtentButton()}"></button>
                    <button class="toggleVisibilityButton fas fa-sm ${layerShow}"
                            @click="${() => this.actionToggleVisibilityButton()}"></button>
                    <button class="toggleInfos fas fa-sm ${infoShow}"
                            @click="${() => this.actionToggleInfos()}"></button>
                </div>
            </div>
            ${info}
            <button class="delete-layer-button" @click="${(event) => this.actionDeleteLayerButton(event)}">
                <i class="fas fa-trash fa-sm"></i>
            </button>
        </div>
    `;
        render(tpl, this);
    }

    connectedCallback() {
        if (!this.isCSSProjectNameSet) {
            const infoElementSelector = `#${this.id} .info-layer-selected`;
            const infoElement = document.querySelector(infoElementSelector);

            infoElement.addEventListener("mouseenter", () => {
                this.handleProjectNameCSS();
            });
        }
    }

    /**
     * Delete the component and the layer associated to it.
     * @param {PointerEvent} event Event occurring.
     */
    actionDeleteLayerButton(event) {
        getLayerSelectionArray().removeElement(event.target.closest(".container-layer-selected").dataset.olUid);
        document.getElementById("layer-selected-holder").removeChild(this);
    }

    /**
     * Switch the visibility of the layer associated to the component.
     */
    actionToggleVisibilityButton() {
        this._element.switchVisibility();
        this.render()
    }

    /**
     * Zoom, on the map, to the extent of the layer associated to the component.
     */
    actionZoomToExtentButton() {
        mapBuilder.map.getView().fit(transformExtent(this._element.getLayer().getProperties().bbox, 'EPSG:4326', mapBuilder.map.getView().getProjection()));
    }

    /**
     * Display or hide the info panel.
     */
    actionToggleInfos() {
        this._element.switchInfoVisibility();
        this.render();
    }

    /**
     * Get the width from a CSS rule.
     * @param {string} rule CSS rule.
     * @returns {number} Width of the rule.
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

    /**
     * Darkened the background color of the "change-order" div when the mouse is over it.
     * @param {PointerEvent} e Event occurring.
     */
    actionMouseOver(e) {
        e.target.closest("div.change-order").style = `background-color: ${this._element.getHoverColor()}; transition: 0.2s;`
    }

    /**
     * Thinned the background color of the "change-order" div when the mouse is out of it.
     * @param {PointerEvent} e Event occurring.
     */
    actionMouseOut(e) {
        e.target.closest("div.change-order").style = `background-color: ${this._element.getColor()}; transition: 0.2s;`
    }

    /**
     * Clean a name.
     * @param {string} aName Name to clean.
     * @returns {string} Cleaned name.
     */
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

    /**
     * Display the attribute table of the layer associated to the component.
     * @param {PointerEvent} e Event occurring.
     * @param {LayerElement} element Layer associated to the component.
     */
    actionDisplayDataButton(e, element) {
        document.getElementById("attribute-btn").classList.add("active");

        var idLayer = e.target.closest(".container-layer-selected").dataset.olUid;
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
            var navLinks = document.querySelectorAll('#attribute-layers-tabs .nav-link');

            navLinks.forEach(function (navLink) {
                navLink.classList.remove('active');
            });

            var tabPane = document.querySelectorAll('#attribute-layers-content .tab-pane');

            tabPane.forEach(function (tabPane) {
                tabPane.classList.remove('show');
                tabPane.classList.remove('active');
            });

            document.getElementById("attribute-layers-tabs").insertAdjacentHTML("beforeend", '\
          <li class="nav-item">\
            <a class="nav-link active" href="#attributeLayer-' + repositoryId + '-' + projectId + '-' + layerName + '" role="tab">' + layer.getProperties().title + '&nbsp;<i data-ol_uid="' + layer.ol_uid + '" class="fas fa-times"></i></a>\
          </li>'
            );

            const container = document.getElementById('attribute-layers-content');

            const addToContainer = (elements) => {
                const attributeTable = new AttributeTable(elements);
                container.appendChild(attributeTable);
                attributeTable.updateContent();
            };

            if (document.getElementById("attribute-layers-content").innerHTML === "") {
                const attributeTable = new AttributeTable(elements);
                container.appendChild(attributeTable);
                attributeTable.updateContent();
            } else {
                addToContainer(elements);
            }

            // Handle tab click events
            document.querySelectorAll('#attribute-layers-tabs a').forEach(function(tab) {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    var tabElement = new bootstrap.Tab(this);
                    tabElement.show();
                });
            });

            // Handle close tabs
            document.querySelectorAll('#attribute-layers-tabs .fa-times').forEach((closeIcon) => {
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

                        this._element.setAttributeTableVisibility(false);
                        this.render();

                        // Hide bottom dock
                        if (document.getElementById("attribute-layers-content").textContent.trim() === "") {
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

    handleProjectNameCSS() {
        if (this.isCSSProjectNameSet) return;

        this.isCSSProjectNameSet = true;

        const projectNameElement = document.querySelector(`#${this.id} .info-layer-selected .repository-layer-selected`);
        const diffWidth = projectNameElement.scrollWidth - projectNameElement.clientWidth;

        if (diffWidth > 0) {
            const transitionTime = Math.round((diffWidth / 80) * 10) / 10;
            const css = `
            #${this.id} .info-layer-selected:hover .repository-layer-selected {
                transform: translateX(calc(0px - ${diffWidth}px));
                transition: ${transitionTime}s ease-in-out;
            }
        `;
            this.addDynamicStyle(css);
        }
    }

    addDynamicStyle(css) {
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

}

customElements.define('lizmap-layer-selected', LayerSelected);
