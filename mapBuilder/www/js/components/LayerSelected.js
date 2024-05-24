import {html, render} from 'lit-html';
import {LayerArray} from "../modules/LayerArray";
import {transformExtent} from "ol/proj";

export class LayerSelected extends HTMLElement {

  constructor(container) {
    super();
    this.container = container;
    this._layerSelected = new LayerArray();
  }

  updateLayerSelected(value) {
    this._layerSelected.setArray(value);
    this.render();
  }

  addElement(value) {
    this._layerSelected.addElement(value);
    this.render();
  }

  /**
   * @param {LayerElement} element
   */
  template = (element) => {
    let layerShow = element.isVisible() ? "fa-eye" : "fa-eye-slash";
    let infoShow = element.isInfoVisible() ? "table-cell" : "none";
    let attributeTableShow;

    if (element.getLayer().getProperties().hasAttributeTable) {
      attributeTableShow = element.isAttributeTableOpened() ? html`
          <button id="layerSelectedDataButton" class="btn btn-sm" disabled>
              <i class="fas fa-list-ul"></i>
          </button>` : html`
          <button id="layerSelectedDataButton" class="btn btn-sm">
              <i class="fas fa-list-ul"></i>
          </button>`
    }

    return html`
        <tr role="row" aria-selected="false" class="containerLayerSelected" id="${element.getUid()}">
            <td role="gridcell">
                <span class="titleLayerSelected">${element.getLayer().getProperties().title + " | " + element.getUid()}</span>
            </td>
            <td class="changeOrder" role="gridcell">
                <div class="fas fa-caret-up changeOrder changeOrderUp"
                     @click="${(event) => this.actionChangeOrderUp(event)}"></div>
                <div class="fas fa-caret-down changeOrder changeOrderDown"
                     @click="${(event) => this.actionChangeOrderDown(event)}"></div>
            </td>
            <td class="deleteLayerButton" role="gridcell" @click="${(event) => this.actionDeleteLayerButton(event)}">
                <button class="btn btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
            <td class="toggleVisibilityButton" @click="${(event) => this.actionToggleVisibilityButton(event, element)}">
                <button class="btn btn-sm">
                    <i class="fas ${layerShow}"></i>
                </button>
            </td>
            <td class="zoomToExtentButton" @click="${(event) => this.actionZoomToExtentButton(event, element)}">
                <button class="btn btn-sm">
                    <i class="fas fa-search-plus"></i>
                </button>
            </td>
            <td class="displayDataButton">
                ${attributeTableShow}
            </td>
            <td class="toggleInfos" @click="${(event) => this.actionToggleInfos(event, element)}">
                <button class="btn btn-sm">
                    <i class="fas fa-info"></i>
                </button>
            </td>
            <td class="layerSelectedStyles" role="gridcell" style="display : ${infoShow};">
                ${element.getLayer().getSource().getParams()["STYLES"]}
            </td>
            <td class="changeOpacityButton" role="gridcell" style="display : ${infoShow};"
                @click="${(event) => this.actionChangeOpacity(event, element)}">
                <div class="btn-group btn-group-sm" role="group" aria-label="Opacity">
                    <button type="button" class="btn ">20</button>
                    <button type="button" class="btn ">40</button>
                    <button type="button" class="btn ">60</button>
                    <button type="button" class="btn ">80</button>
                    <button type="button" class="btn active">100</button>
                </div>
            </td>
        </tr>
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
    this._layerSelected.getArray().forEach((value) => {
      console.log("Nom : " + value.getLayer().getSource().getParams()["LAYERS"] + " | zIndex : " + value.getLayer().getZIndex())
    });
    console.log("-----------------");
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
    this._layerSelected.changeOrder(event.target.closest("tr").id, "up");
    this.render();
  }

  /**
   * @param {PointerEvent} event event occurring
   */
  actionChangeOrderDown(event) {
    this._layerSelected.changeOrder(event.target.closest("tr").id, "down");
    this.render();
  }

  /**
   * @param {PointerEvent} event event occurring
   */
  actionDeleteLayerButton(event) {
    this._layerSelected.removeElement(event.target.closest("tr").id);
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
   * @param {PointerEvent} event event occurring
   * @param {LayerElement} element layer element to act on
   */
  actionChangeOpacity(event, element) {
    element.getLayer().setOpacity(parseInt(event.target.closest(".btn").textContent) / 100);
  }

  /**
   * @param {LayerElement} element layer element to act on
   */
  displayData(element) {

  }
}

customElements.define('lizmap-layer-selected', LayerSelected);