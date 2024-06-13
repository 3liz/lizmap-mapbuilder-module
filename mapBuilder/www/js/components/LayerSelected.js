import {html, render} from 'lit-html';
import {LayerArray} from "../modules/LayerArray";
import {transformExtent} from "ol/proj";
import {Slider} from "./Slider";

export class LayerSelected extends HTMLElement {

  constructor(container) {
    super();
    this.container = container;
    this._layerSelected = new LayerArray();
  }

  addElement(value, color) {
    this._layerSelected.addElement(value, color);
    this.render();
  }

  /**
   * @param {LayerElement} element
   */
  template = (element) => {
    let layerShow = element.getLayer().isVisible() ? "fa-eye" : "fa-eye-slash active";
    let infoShow = element.isInfoVisible() ? "fa-info active" : "fa-info";
    let attributeTableShow;
    let info;

    if (element.getLayer().getProperties().hasAttributeTable) {
      attributeTableShow = element.isAttributeTableOpened() ? html`
          <button class="dispayDataButton fas fa-list-ul active" disabled></button>` : html`
          <button class="dispayDataButton fas fa-list-ul"></button>`
    }

    if (element.isInfoVisible()) {

      let sliderWidth = this.getWidthFromCssRule("custom-slider .slider");

      let slider = new Slider(`
        background-color: ${element.getColor()};
        left: ${Math.floor(((element.getLayer().getOpacity() * 100) * (sliderWidth - 10)) / 100) + 'px'};
        `,
        element.getLayer()
      );

      info = html`
          <div class="midLine">
              <span class="layerStyleSpan">${element.getLayer().getSource().getParams()["STYLES"]}</span>
              ${slider}
          </div>`;
    }

    return html`
        <div class="containerLayerSelected" id="${element.getUid()}">
            <div class="changeOrderContainer" style="background-color: ${element.getColor()}">
                <div class="changeOrder changeOrderUp" style="background-color: ${element.getColor()}"
                     @click="${(event) => this.actionChangeOrderUp(event)}"
                     @mouseover='${(e) => this.actionMouseOver(e, element)}'
                     @mouseout='${(e) => this.actionMouseOut(e, element)}'
                >
                    <i class="fas fa-caret-up"></i>
                </div>
                <div class="changeOrder changeOrderDown" style="background-color: ${element.getColor()}"
                     @click="${(event) => this.actionChangeOrderDown(event)}"
                     @mouseover='${(e) => this.actionMouseOver(e, element)}'
                     @mouseout='${(e) => this.actionMouseOut(e, element)}'
                >
                    <i class="fas fa-caret-down"></i>
                </div>
            </div>
            <div class="layerSelectedContent">
                <div class="upperLine">
                    <span class="titleLayerSelected">${element.getLayer().getProperties().title}</span>
                    <div class="layerButtonsDiv">
                        ${attributeTableShow}
                        <button class="zoomToExtentButton fas fa-search-plus"
                                @click="${(event) => this.actionZoomToExtentButton(event, element)}"></button>
                        <button class="toggleVisibilityButton fas ${layerShow}"
                                @click="${(event) => this.actionToggleVisibilityButton(event, element)}"></button>
                        <button class="toggleInfos fas ${infoShow}"
                                @click="${(event) => this.actionToggleInfos(event, element)}"></button>
                    </div>
                </div>
                ${info}
                <button class="deleteLayerButton" @click="${(event) => this.actionDeleteLayerButton(event)}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
  }

  render() {
    let result = html``;
    this._layerSelected.getArray().forEach((el) => {
      let layer = this.template(el);
      result = html`
          ${result}
          ${layer}
      `;
    });
    render(result, this.container);
  }

  connectedCallback() {
    this.render();
  }

  /**
   * @returns {LayerArray}
   */
  getLayerArray() {
    return this._layerSelected;
  }

  /**
   * @param {PointerEvent} event event occurring
   */
  actionChangeOrderUp(event) {
    this._layerSelected.changeOrder(event.target.closest(".containerLayerSelected").id, "up");
    this.render();
  }

  /**
   * @param {PointerEvent} event event occurring
   */
  actionChangeOrderDown(event) {
    this._layerSelected.changeOrder(event.target.closest(".containerLayerSelected").id, "down");
    this.render();
  }

  /**
   * @param {PointerEvent} event event occurring
   */
  actionDeleteLayerButton(event) {
    this._layerSelected.removeElement(event.target.closest(".containerLayerSelected").id);
    this.render();
  }

  /**
   * @param {PointerEvent} event event occurring
   * @param {LayerElement} element layer element to act on
   */
  actionToggleVisibilityButton(event, element) {
    element.switchVisibility();
    this.render()
  }

  /**
   * @param {PointerEvent} event event occurring
   * @param {LayerElement} element layer element to act on
   */
  actionZoomToExtentButton(event, element) {
    mapBuilder.map.getView().fit(transformExtent(element.getLayer().getProperties().bbox, 'EPSG:4326', mapBuilder.map.getView().getProjection()));
  }

  /**
   * @param {LayerElement} element layer element to act on
   * @param {boolean} value visibility
   */
  actionDisplayDataButton(element, value) {
    element.setAttributeTableVisibility(value);
    this.render()
  }

  /**
   * @param {PointerEvent} event event occurring
   * @param {LayerElement} element layer element to act on
   */
  actionToggleInfos(event, element) {
    element.switchInfoVisibility();
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

  actionMouseOver(e, element) {
    e.target.closest("div.changeOrder").style = `background-color: ${element.getHoverColor()}; transition: 0.2s;`
  }

  actionMouseOut(e, element) {
    e.target.closest("div.changeOrder").style = `background-color: ${element.getColor()}; transition: 0.2s;`
  }
}

customElements.define('lizmap-layer-selected', LayerSelected);