// it is important to set global var before any imports
import $ from 'jquery';

import 'ol/ol.css';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {defaults as defaultControls, Control, ScaleLine} from 'ol/control.js';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import {getDistance} from "ol/sphere";

import OSM from 'ol/source/OSM.js';
import StadiaMaps from 'ol/source/StadiaMaps.js';
import BingMaps from 'ol/source/BingMaps.js';
import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import {getWidth} from 'ol/extent.js';

import ImageWMS from 'ol/source/ImageWMS.js';
import {transformExtent, get as getProjection, transform, toLonLat} from 'ol/proj.js';

import {DragZoom} from 'ol/interaction.js';
import {always as alwaysCondition, shiftKeyOnly as shiftKeyOnlyCondition} from 'ol/events/condition.js';

import './modules/bottom-dock.js';

import {LayerStore} from "./components/LayerStore";
import {addElementToLayerArray, updateFromLayerTree} from "./modules/LayerSelection/LayerSelection.js";
import {CustomProgress} from "./components/inkmap/ProgressBar";
import {FlashMessage} from "./components/FlashMessage"

import {getJobStatus, queuePrint} from './dist/inkmap.js';

import {KeywordsManager} from "./modules/Filter/KeywordsManager";
// Filters
import {ExtentFilter} from './modules/Filter/FilterExtent.js';
import {KeywordsFilter} from './modules/Filter/FilterKeywords.js';

// Extent on metropolitan France if not defined in mapBuilder.ini.php
var originalCenter = [217806.92414447578, 5853470.637803803];
var originalZoom = 6;

// 1 inch = 2,54 cm = 25,4 mm
const INCHTOMM = 25.4;

document.addEventListener('DOMContentLoaded', () => {
    // Parsing JSONs
    const lizUrlsJSON = JSON.parse(document.getElementById('conf-script-lizUrls').textContent);
    const mapBuilderJSON = JSON.parse(document.getElementById('conf-script-mapBuilder').textContent);
    const lizDictJSON = JSON.parse(document.getElementById('conf-script-lizDict').textContent);

    // Initializing vars
    let mapBuilder = {};

    const { layerStoreTree, extent, baseLayerKeyOSMCycleMap, baseLayerKeyBing, baseLayerKeyIGN } = mapBuilderJSON;
    Object.assign(mapBuilder, { layerStoreTree, extent, baseLayerKeyOSMCycleMap, baseLayerKeyBing, baseLayerKeyIGN });
    mapBuilder.baseLayer = mapBuilderJSON["baseLayer"];

    let lizDict = lizDictJSON["lizDict"];

    let lizUrls = {};
    const { basepath, config, wms, media, mapcontext_add, mapcontext_delete, mapcontext_get } = lizUrlsJSON["lizUrls"];
    Object.assign(lizUrls, { basepath, config, wms, media, mapcontext_add, mapcontext_delete, mapcontext_get });

    window.lizUrls = lizUrls;
    window.mapBuilder = mapBuilder;
    window.lizDict = lizDict;

    __webpack_public_path__ = lizUrls.basepath+'mapBuilder/js/';

    /**
     * Add a flash message to the page
     * @param {string} aMessage Message to display
     * @param {string} aType Type of message (info, danger, success)
     * @param {boolean} aClose Add a close button
     * @param {number} aTimer Time before message disappear
     * @returns {HTMLElement} The message element
     */
    function mAddMessage( aMessage, aType, aClose, aTimer ) {
        const mTypeList = ['info', 'danger', 'success'];
        let mType = 'info';

        if (mTypeList.includes(aType)) {
            mType = aType;
        }

        const flashM = new FlashMessage(aMessage, mType, aClose, aTimer);

        if(aTimer !== undefined){
            setTimeout(function() {
                flashM.removeElement();
            }, aTimer);
        }

        return flashM.getElement();
    }

    /**
     * Refresh the layerSelected tree to reflect OL layer's state
     * @returns {Array} An array of layer objects representing the selected layers in the map, organized by z-index.
     */
    function refreshLayerSelected() {
        var layerTree = [];
        mapBuilder.map.getLayers().forEach(function (layer) {
            // Don't add base layer
            if (!layer.getProperties().hasOwnProperty('baseLayer')) {
                var layerObject = {
                    repositoryId: layer.getProperties().repositoryId,
                    projectId: layer.getProperties().projectId,
                    projectName: layer.getProperties().projectName,
                    elementColor: layer.getProperties().elementColor,
                    title: layer.getProperties().title,
                    styles: layer.getSource().getParams().STYLES,
                    hasAttributeTable: layer.getProperties().hasAttributeTable,
                    name: layer.getSource().getParams().LAYERS,
                    ol_uid: layer.ol_uid
                };

                if (layer.getZIndex() !== undefined) {
                    layerTree[layer.getZIndex()] = layerObject;
                }
            }
        });

        // Reverse to show top layers at top of the tree
        layerTree.reverse();
        // Remove empty values (TODO: à améliorer)
        layerTree = layerTree.filter(n => n);

        // Refresh legends
        loadLegend();

        return layerTree;
    }

    var dragZoomControl = class DragZoomControl extends Control {
        constructor(opt_options) {
            var options = opt_options || {};

            var button = document.createElement('button');
            button.className = 'fas fa-square';
            button.title = lizDict['zoomrectangle'];

            var element = document.createElement('div');
            element.className = 'ol-drag-zoom ol-unselectable ol-control';
            element.appendChild(button);

            super({
                element: element,
                target: options.target,
            });

            button.addEventListener('click', this.handleDragZoom.bind(this), false);
        }

        handleDragZoom() {

            var element = document.querySelector(".ol-drag-zoom.ol-unselectable.ol-control");

            if (element.classList.contains('active')) {
                element.classList.remove('active');

                this.getMap().getInteractions().forEach(function (interaction) {
                    if (interaction instanceof DragZoom) {
                        interaction.condition_ = shiftKeyOnlyCondition;
                    }
                });
            } else {
                element.classList.add('active');

                this.getMap().getInteractions().forEach(function (interaction) {
                    if (interaction instanceof DragZoom) {
                        interaction.condition_ = alwaysCondition;
                    }
                });
            }
        }
    }
    var zoomToOriginControl = class ZoomToOriginControl extends Control {

        constructor(opt_options) {

            var options = opt_options || {};

            var button = document.createElement('button');
            button.className = 'fas fa-expand-arrows-alt';
            button.title = lizDict['zoominitial'];

            var element = document.createElement('div');
            element.className = 'ol-zoom-origin ol-unselectable ol-control';
            element.appendChild(button);

            super({
                element: element,
                target: options.target,
            });

            button.addEventListener('click', this.handleZoomToOrigin.bind(this), false);
        }

        handleZoomToOrigin() {
            this.getMap().getView().setCenter(originalCenter);
            this.getMap().getView().setZoom(originalZoom);
        };
    }

    // Hide header if h=0 in URL
    const url = new URL(window.location.href);
    if (url.searchParams.get('h') === '0'){
        document.getElementById('header').style.display = "none";
        document.getElementById('map').style.paddingTop = 0;
        document.getElementById('mapmenu').style.paddingTop = 0;
        document.getElementById('dock').style.top = 0;
    }

    mapBuilder.map = new Map({
        target: 'map',
        controls: defaultControls({
            zoomOptions: {
                zoomInTipLabel: lizDict['zoomin'],
                zoomOutTipLabel: lizDict['zoomout']
            }
        }).extend([
            new ScaleLine(),
            new dragZoomControl(),
            new zoomToOriginControl()
        ]),
        view: new View({
            center: originalCenter,
            zoom: originalZoom
        })
    });

    // Refresh legend when resolution changes
    mapBuilder.map.getView().on('change:resolution', loadLegend);

    // baseLayer is set in mapBuilder.ini.php
    if(mapBuilder.hasOwnProperty('baseLayer')){
        const baseLayerNames = mapBuilder.baseLayer.split(',');

        for (const baseLayerName of baseLayerNames) {
            var baseLayer = null;
            if(baseLayerName === 'osmMapnik'){
                baseLayer = new TileLayer({
                    source: new OSM()
                });
            }
            else if(baseLayerName === 'osmStadiaMapsToner'){
                baseLayer = new TileLayer({
                    source: new StadiaMaps({
                        layer: 'stamen_toner_lite'
                    })
                });
            }
            else if((baseLayerName === 'bingStreets'
        || baseLayerName === 'bingSatellite'
        || baseLayerName === 'bingHybrid')
        && mapBuilder.hasOwnProperty('baseLayerKeyBing')){
                var bingMapsCorrespondance = {
                    'bingStreets' : 'Road',
                    'bingSatellite' : 'Aerial',
                    'bingHybrid' : 'AerialWithLabels'
                };
                baseLayer = new TileLayer({
                    visible: false,
                    preload: Infinity,
                    source: new BingMaps({
                        key: mapBuilder.baseLayerKeyBing,
                        imagerySet: bingMapsCorrespondance[baseLayerName]
                    })
                });
            }
            else if((baseLayerName === 'ignTerrain'
        || baseLayerName === 'ignStreets'
        || baseLayerName === 'ignSatellite'
        || baseLayerName === 'ignCadastral')){
                var ignCorrespondance = {
                    ignStreets : 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
                    ignSatellite : 'ORTHOIMAGERY.ORTHOPHOTOS',
                    ignCadastral : 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS'
                };

                var ignImageFormat = {
                    ignStreets : 'image/png',
                    ignSatellite : 'image/jpeg',
                    ignCadastral : 'image/png'
                };

                var ignZoomLevels = {
                    ignStreets : 20,
                    ignSatellite : 22,
                    ignCadastral : 20
                };

                var resolutions = [];
                var matrixIds = [];
                var proj3857 = getProjection('EPSG:3857');
                var maxResolution = getWidth(proj3857.getExtent()) / 256;

                for (var i = 0; i < ignZoomLevels[baseLayerName]; i++) {
                    matrixIds[i] = i.toString();
                    resolutions[i] = maxResolution / Math.pow(2, i);
                }

                var tileGrid = new WMTSTileGrid({
                    origin: [-20037508, 20037508],
                    resolutions: resolutions,
                    matrixIds: matrixIds
                });

                var ign_source = new WMTS({
                    url: "https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile",
                    layer: ignCorrespondance[baseLayerName],
                    matrixSet: 'PM',
                    format: ignImageFormat[baseLayerName],
                    projection: 'EPSG:3857',
                    tileGrid: tileGrid,
                    style: 'normal',
                    attributions: `<a href="https://www.ign.fr/" target="_blank">
          <img src="https://wxs.ign.fr/static/logos/IGN/IGN.gif" 
          title="Institut national de l'information géographique et forestière" alt="IGN"></a>`
                });

                baseLayer = new TileLayer({
                    source: ign_source
                });
            }
            else if(baseLayerName === 'emptyBaselayer'){
                baseLayer = new TileLayer({
                });
            }

            if(baseLayer){
                var baseLayerSelect = document.querySelector('#baseLayerSelect')
                var visibility = baseLayerSelect.options[baseLayerSelect.selectedIndex].value === baseLayerName;

                baseLayer.setProperties({
                    title: baseLayerName,
                    visible: visibility,
                    baseLayer: true // Add baseLayer property to treat those layers differently
                });

                mapBuilder.map.addLayer(baseLayer);
            }
        }
    }

    document.querySelector("#baseLayerSelect").addEventListener("change", function() {
        var baseLayerSelect = this;
        var baseLayerSelected = baseLayerSelect.options[baseLayerSelect.selectedIndex].value;
        mapBuilder.map.getLayers().forEach(function(layer) {
            if(layer.getProperties().baseLayer){
                layer.setVisible(layer.getProperties().title === baseLayerSelected);
            }
        });
    });

    // Extent is set in mapBuilder.ini.php => fit view on it and override originalCenter and originalZoom
    if(mapBuilder.hasOwnProperty('extent')){

        if (mapBuilder.extent.length < 1) {
            mapBuilder.extent = [-4.65,40.63,9.10,51.68];
            mAddMessage(lizDict["empty.extent.configuration"], "info", true, 10000);
        }

        try {
            mapBuilder.map.getView().fit(transformExtent(mapBuilder.extent, 'EPSG:4326', mapBuilder.map.getView().getProjection()));
        } catch (e) {
            mAddMessage(lizDict["error.extent"], "danger", true, 10000)
            console.error(e)
            mapBuilder.map.getView().fit(transformExtent([-4.65,40.63,9.10,51.68], 'EPSG:4326', mapBuilder.map.getView().getProjection()));
        }

        originalCenter = mapBuilder.map.getView().getCenter();
        originalZoom = mapBuilder.map.getView().getZoom();
    }

    /**
     * Handle the end of movement on the map
     * @param {Event} evt Event
     */
    function onMoveEnd(evt) {
        if(document.querySelector(".ol-drag-zoom").classList.contains("active")){
            document.querySelector(".ol-drag-zoom.active").classList.remove("active");

            evt.map.getInteractions().forEach(function(interaction) {
                if(interaction instanceof DragZoom){
                    interaction.condition_ = shiftKeyOnlyCondition;
                }
            });
        }

        // Filter if is active
        filter();
    }

    mapBuilder.map.on('moveend', onMoveEnd);

    // Handle getFeatureInfo when map is clicked
    mapBuilder.map.on('singleclick', function(evt) {
        var viewResolution = mapBuilder.map.getView().getResolution();
        var projection = mapBuilder.map.getView().getProjection();
        var getFeatureInfos = [];

        mapBuilder.map.getLayers().forEach(function(layer) {
            if( !layer.getProperties().hasOwnProperty('baseLayer') && layer.values_.popup == "True"){
                var url = layer.getSource().getFeatureInfoUrl(
                    evt.coordinate, viewResolution, projection,
                    {
                        'INFO_FORMAT': 'text/html',
                        'FI_POINT_TOLERANCE': 25,
                        'FI_LINE_TOLERANCE': 10,
                        'FI_POLYGON_TOLERANCE': 5
                    }
                );

                // Display getFeatureInfos by zIndex order
                if (url) {
                    getFeatureInfos[layer.getZIndex()] = url;
                }
            }
        });

        // Fetch getFeatureInfos
        var promises = [];
        for (var i = getFeatureInfos.length - 1; i >= 0; i--) {
            if(getFeatureInfos[i] !== undefined){
                promises.push(new Promise(resolve =>
                    $.get(getFeatureInfos[i], function(gfi) {
                        resolve(gfi);
                    })
                ));
            }
        }

        Promise.all(promises).then(results => {
            var popupHTML = '';
            for (var i = 0; i < results.length; i++) {
                popupHTML += results[i];
            }

            document.getElementById('popup-content').innerHTML = popupHTML;
            var popupDisplayTab = document.querySelector('#popup-display-tab');
            // Display if not empty
            if(popupHTML !== ''){
                // Show popup tab
                popupDisplayTab.classList.remove('d-none');
                $('#popup-display-tab').tab('show');
                popupDisplayTab.focus();
            }else{
                if(document.querySelector('#popup-display').classList.contains("active")){
                    popupDisplayTab.classList.add('d-none');
                    document.querySelector("#dock").style.display = 'none';
                }
            }
        });
    });

    // Keywords manager
    let keywordsManager = new KeywordsManager();

    document.addEventListener('keywordsUpdated', () => {
        filter();
    });

    //Build the tree
    var listTree = [];

    var layerStore;

    layerStore = new LayerStore(document.getElementById("layer-store-holder"), keywordsManager);

    listTree = layerStore.getTree();

    // Carry filter buttons
    let listFilters = {
        Extent: new ExtentFilter(layerStore),
        Keywords: new KeywordsFilter(layerStore, keywordsManager)
    };
    let selectedFilters = [];
    initFilterButtons();
    initEventKeywordsFilters();

    /**
     * Initializes event listeners for managing keyword filters in the UI.
     */
    function initEventKeywordsFilters() {
        const button = document.getElementById("filterButtonKeywords");

        button.addEventListener("click", function() {
            if (button.classList.contains("active")) {
                document.getElementById("filter-keywords-handler").classList.add("active");
            } else {
                document.getElementById("filter-keywords-handler").classList.remove("active");
            }
        });

        document.getElementById("filter-keywords-list-button").addEventListener("click", function() {
            const list = document.getElementById("filter-keywords-list")
            if (list.classList.contains("active")) {
                list.classList.remove("active");
            } else {
                list.classList.add("active");
            }
        });

        document.getElementById("keywordsUnionButton").addEventListener("click", function() {
            keywordsManager.setCalculationMethod("union");
            document.getElementById("filter-keywords-list-button").classList.replace("btn-danger", "btn-info");
            document.getElementById("filter-keywords-list-words").classList.remove("inter");
            filter();
        });

        document.getElementById("keywordsIntersectButton").addEventListener("click", function() {
            keywordsManager.setCalculationMethod("intersect");
            document.getElementById("filter-keywords-list-button").classList.replace("btn-info", "btn-danger");
            document.getElementById("filter-keywords-list-words").classList.add("inter");
            filter();
        });

        const textInputKeywords = document.getElementById("keywordsFindInput");

        let timeout;

        textInputKeywords.addEventListener("input", function () {
            clearTimeout(timeout);

            timeout = setTimeout(() => {
                keywordsManager.refreshKeywordsFromSearch(textInputKeywords.value);
            }, 400);
        });
    }

    /**
     * Initialize filter buttons.
     */
    function initFilterButtons() {
        const filtersUpdate = new CustomEvent('selectedFiltersUpdated');

        document.querySelectorAll('#filter-buttons > button').forEach(button => {
            const filterName = button.name;

            button.addEventListener("click", () => {
                if (!button.classList.contains("active")) {
                    button.classList.add("active");
                    selectedFilters.push(filterName);
                    document.dispatchEvent(filtersUpdate);
                } else {
                    button.classList.remove("active");
                    selectedFilters.splice(selectedFilters.indexOf(filterName), 1);
                    document.dispatchEvent(filtersUpdate);
                }
            });
        });
    }

    document.addEventListener('selectedFiltersUpdated', () => {
        if (selectedFilters.length < 1) {
            resetTree();
        } else {
            resetTree(false)
            filter();
        }
    });

    /**
     * This method iterates through an array of selected filters, applying each filter function from the `listFilters` object.
     */
    async function filter() {
        layerStore.setProjectAllVisible();

        for (let i = 0; i < selectedFilters.length; i++) {
            listFilters[selectedFilters[i]].filter();
        }
    }

    /**
     * Resets the state of the tree structure and updates it.
     * If the `complete` parameter is set to true, additional UI elements are reset.
     * @param {boolean} [complete] - Indicates if a complete reset should occur, including UI elements.
     */
    function resetTree(complete = true) {
        listTree = layerStore.setProjectAllVisible();
        if (complete) {
            document.getElementById("filter-keywords-list").classList.remove("active");
            document.getElementById("filter-keywords-handler").classList.remove("active");
        }
        layerStore.updateTree(listTree);
    }

    /* Handle custom addLayerButton clicks */
    document.querySelector('#layer-store-holder').addEventListener('click', function (e) {
        if (e.target.closest('.layer-store-layer') && e.target.tagName !== "SELECT") {
            var element = e.target.closest('.layer-store-layer');

            var node = layerStore.getNodeFromUuid(listTree, element.id);
            var nodeLi = document.getElementById(element.id).closest("li");

            var repositoryId = node.getRepository();
            var projectId = node.getProject();

            var newLayer = new ImageLayer({
                title: node.getTitle(),
                repositoryId: repositoryId,
                projectId: projectId,
                bbox: node.getBbox(),
                popup: node.getPopup(),
                hasAttributeTable: node.hasAttributeTable(),
                source: new ImageWMS({
                    url: lizUrls.wms + '?repository=' + repositoryId + '&project=' + projectId,
                    params: {
                        'LAYERS': node.getName(),
                        'STYLES': nodeLi.querySelector(".layerStyles").value
                    },
                    serverType: 'qgis'
                })
            });
            newLayer.setProperties({"projectName": node.getProjectName()});

            // Set min/max resolution if min/max scale are defined in getCapabilities
            if (node.getMinScale()) {
                newLayer.setMinResolution(node.data.minScale * INCHTOMM / (1000 * 90 * window.devicePixelRatio));
            }
            if (node.getMaxScale()) {
                newLayer.setMaxResolution(node.data.maxScale * INCHTOMM / (1000 * 90 * window.devicePixelRatio));
            }

            var maxZindex = -1;
            // Get maximum Z-index to put new layer at top of the stack
            mapBuilder.map.getLayers().forEach(function (layer) {
                var zIndex = layer.getZIndex();
                if (zIndex !== undefined && zIndex > maxZindex) {
                    maxZindex = zIndex;
                }
            });

            if (maxZindex > -1) {
                newLayer.setZIndex(maxZindex + 1);
            } else {
                newLayer.setZIndex(0);
            }

            // Show layer is loading
            newLayer.getSource().on('imageloadstart', function () {
                var span1 = document.createElement('span');
                span1.classList.add('spinner-grow', 'spinner-grow-sm');
                span1.setAttribute('title', lizDict['selector.layers.loading'] + '...');
                span1.setAttribute('role', 'status');

                var span2 = document.createElement('span');
                span2.classList.add('sr-only');
                span2.textContent = lizDict['selector.layers.loading'] + '...';

                span1.appendChild(span2);

                var layersLoading = document.getElementById('layers-loading');
                layersLoading.insertBefore(span1, layersLoading.firstChild);
            });

            // Show layer had loaded
            newLayer.getSource().on('imageloadend', function () {
                document.querySelector("#layers-loading > .spinner-grow:first-child").remove();
            });

            // When the image loading generate an error
            newLayer.getSource().on('imageloaderror', function () {
                document.querySelector("#layers-loading > .spinner-grow:first-child").remove();

                if (document.getElementById("message").children.length <= 7) {
                    mAddMessage(
                        lizDict['layer.error'] +
                        ' (' +
                        newLayer.getProperties().title +
                        ' : ' +
                        newLayer.getProperties().projectName +
                        ')',
                        'danger',
                        true,
                        2000
                    );
                }
            });

            mapBuilder.map.addLayer(newLayer);
            refreshLayerSelected();

            addElementToLayerArray(newLayer, element.style.backgroundColor);

            mAddMessage(lizDict['layer.added'], 'success', true, 1000);
        }
    });

    /**
     * Load the legend of the layers
     */
    function loadLegend(){
        var legends = [];
        var legendsDiv = "";
        var scale = (mapBuilder.map.getView().getResolution() * 1000 * 90 * window.devicePixelRatio) / INCHTOMM;

        mapBuilder.map.getLayers().forEach(function(layer) {
            if (layer instanceof ImageLayer){
                var layerSource = layer.getSource();
                legends[layer.getZIndex()] = layerSource.getUrl()+'&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER='+layerSource.getParams().LAYERS+'&STYLE='+layerSource.getParams().STYLES+'&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=150&ITEMFONTSIZE=9&SYMBOLSPACE=1&ICONLABELSPACE=2&DPI=96&LAYERSPACE=0&LAYERFONTBOLD=FALSE&SCALE='+scale;
            }
        });

        for (var i = legends.length - 1; i >= 0; i--) {
            if(legends[i] !== undefined){
                legendsDiv += '<div><img src="' + legends[i] + '"></div>';
            }
        }
        document.getElementById('legend-content').innerHTML = legendsDiv;
    }

    document.addEventListener('layerSelectedChanges', function () {
        loadLegend();
    });

    // Open/Close dock behaviour
    $('#dock-close > button').on("click", function(){
        $('#mapmenu .dock').removeClass('active');
        $("#dock").hide();
    });

    $('#mapmenu .nav-link').on('shown.bs.tab', function() {
        $("#dock").show();
    });

    $('#pdf-print-btn').on("click", async function(){

        $(this).addClass("disabled");
        document.body.style.cursor = 'progress';

        import(/* webpackChunkName: "jspdf" */ 'jspdf' ).then(async ({default: jsPDF}) => {
            const dims = {
                a0: [1189, 841],
                a1: [841, 594],
                a2: [594, 420],
                a3: [420, 297],
                a4: [297, 210],
                a5: [210, 148]
            };

            const format = document.getElementById('format-pdf-print').value;
            const resolution = document.getElementById('resolution-pdf-print').value;
            const dim = dims[format];
            const width = dim[0];
            const height = dim[1];

            // Note that when using import() on ES6 modules you must reference the .default property as it's the actual module object that will be returned when the promise is resolved.
            // => https://webpack.js.org/guides/lazy-loading/
            const pdf = new jsPDF('landscape', 'mm', format);
            // Add title
            pdf.setFontSize(18);
            pdf.text($('#pdf-print-title').val(), 50, 10);

            let offset = 25;
            let maxWidthLegend = 0;

            document.querySelectorAll("#legend img").forEach(function (legend) {
                pdf.addImage(legend, 'PNG', 0, offset * INCHTOMM / resolution);
                offset += legend.height;

                if (legend.width > maxWidthLegend) {
                    maxWidthLegend = legend.width;
                }
            });

            //Scale
            const extent = mapBuilder.map.previousExtent_;

            const left = toLonLat([extent[0], extent[1]]);
            const right = toLonLat([extent[2], extent[3]]);
            const dist = getDistance(left, right);
            const scale = (dist * 1000 / width)

            var baseLayerSelect = document.querySelector('#baseLayerSelect')
            const activeLayer = mapBuilder.map.getAllLayers()[baseLayerSelect.selectedIndex].getProperties().source;

            var layers = [];

            //Generate base layer
            if (baseLayerSelect.value === 'emptyBaselayer') {
                console.log('Empty active layer')
            } else {
                const lib = await import(`./modules/BaseLayers/${baseLayerSelect.value}.js`);
                layers = lib.getInkmapSpec(activeLayer);
                //Scan errors
                if (layers === 10) {
                    console.error("API Key missing")
                    mAddMessage(lizDict['error.api.inkmap'], 'danger', true, 4000);
                    return;
                }
            }

            //Generate annex layers
            var listAnnexLayers = createListAnnexLayers();
            for (var i = 0; i < listAnnexLayers.length; i++) {
                var otherLayer = listAnnexLayers[i].getProperties().source
                layers.push({
                    "type": "WMS",
                    "url": otherLayer.getUrl(),
                    "layer": otherLayer.getParams().LAYERS
                });
            }

            //Indicate other important values
            const specValue = {
                "layers": layers,
                "center": transform(mapBuilder.map.getView().getCenter(), mapBuilder.map.getView().getProjection(), 'EPSG:4326'),
                "size": [width, height, 'mm'],
                "dpi": resolution,
                "scale": scale,
                "projection": mapBuilder.map.getView().getProjection().getCode(),
            };

            //Create progress bar
            var customProgress = new CustomProgress();

            document.getElementById("pdf-print").appendChild(customProgress);

            const jobId = await queuePrint(specValue);

            //Update progress bar depending on the job status.
            getJobStatus(jobId).subscribe((printStatus) => {
                customProgress.setLengthBar(printStatus.progress)

                if (printStatus.progress === 1) {
                    customProgress.setSuccesState();
                    pdf.addImage(URL.createObjectURL(printStatus.imageBlob), 'JPEG', maxWidthLegend * INCHTOMM / resolution, 20, dim[0], dim[1]);
                    pdf.save('map.pdf');
                    setTimeout(() => {
                        document.getElementById("pdf-print").removeChild(customProgress);
                    }, 500);
                }
            });

        });
        document.body.style.cursor = 'auto';
        $(this).removeClass("disabled");
    });

    /**
     * Create a list of WMS annex layers representing the layers put by the user above the base one
     * @returns {ImageLayer[]} List of annex layers
     */
    function createListAnnexLayers() {
        var layersList = [];

        for (var i = 1; i < mapBuilder.map.getAllLayers().length; i++) {
            if (mapBuilder.map.getAllLayers()[i] instanceof ImageLayer) {
                addToList(0, mapBuilder.map.getAllLayers()[i]);
            }
        }

        return layersList;

        /**
         * Recursive function to add a layer to the list of annex layers
         * @param {number} index From 0 to INF
         * @param {ImageLayer} val The layer to add
         * @returns {*} A layerList depending on the action
         */
        function addToList(index, val) {
            if (layersList.length < 1) {
                return layersList.push(val);
            }
            if (layersList[index].getZIndex() > val.getZIndex()) {
                return layersList.splice(index, 0, val);
            }
            if (index + 1 === layersList.length) {
                return layersList.push(val)
            }
            return addToList(index + 1, val);
        }
    }

    //#### MAP CONTEXT

    bindMapContextEvents();

    // Add user's map context
    $('#mapcontext-add-btn').on("click", function(){

        // mapcontext needs a name
        if($("#mapcontext-name").val() == ""){
            mAddMessage(lizDict['geobookmark.name.required'], 'danger', true, 5000);
            return;
        }

        var mapContext = {};

        // First save map center and zoom
        mapContext.center = mapBuilder.map.getView().getCenter();
        mapContext.zoom = mapBuilder.map.getView().getZoom();
        // Then save layers
        mapContext.layers = [];

        mapBuilder.map.getLayers().forEach(function(layer) {
            // Don't add base layer
            if( ! layer.getProperties().hasOwnProperty('baseLayer')){

                var layerProperties = layer.getProperties();
                var layerSourceParams = layer.getSource().getParams();

                mapContext.layers.push({
                    title: layerProperties.title,
                    repositoryId: layerProperties.repositoryId,
                    projectId: layerProperties.projectId,
                    projectName: layerProperties.projectName,
                    elementColor: layerProperties.elementColor,
                    opacity: layerProperties.opacity,
                    bbox: layerProperties.bbox,
                    popup: layerProperties.popup,
                    visible: layerProperties.visible,
                    zIndex: layerProperties.zIndex,
                    minResolution: layerProperties.minResolution,
                    maxResolution: layerProperties.maxResolution, //maxResolution peut valoir Infinity et devient null en json
                    name: layerSourceParams.LAYERS,
                    style: layerSourceParams.STYLES
                });
            }
        });

        $.ajax({
            url: lizUrls.mapcontext_add,
            type:"POST",
            data: {
                name: $("#mapcontext-name").val(),
                is_public: $("#publicmapcontext").is(':checked'),
                mapcontext: JSON.stringify(mapContext)
            },
            dataType:"html",
            success: function( data ){
                setMapContextContent(data);
                mAddMessage(lizDict['geobookmark.added'], 'success', true, 5000);
            }
        });
    });

    /**
     * Bind events on map context buttons
     */
    function bindMapContextEvents(){

        // delete map context
        $('.btn-mapcontext-del').on("click", function(){
            if (confirm( lizDict['geobookmark.delete.confirm'] )){
                var mcId = $(this).val();

                $.ajax({
                    url: lizUrls.mapcontext_delete,
                    type:"POST",
                    data: { id: mcId },
                    dataType:"html",
                    success: function( data ){
                        setMapContextContent(data);
                        mAddMessage(lizDict['geobookmark.deleted'], 'success', true, 1000);
                    }
                });
            }
            return false;
        });
        // show map context
        $('.btn-mapcontext-run').click(function(){
            var mcId = $(this).val();

            $.ajax({
                url: lizUrls.mapcontext_get,
                type:"GET",
                data: { id: mcId },
                dataType:"json",
                success: function( mapcontext ){
                    // Remove all existing layers (begins index at end because index changes after remove !)
                    var layers = mapBuilder.map.getLayers().getArray();
                    for (var i = layers.length - 1; i >= 0; i--) {
                        if( ! layers[i].getProperties().hasOwnProperty('baseLayer')){
                            mapBuilder.map.removeLayer(layers[i]);
                        }
                    }

                    // Set zoom and center
                    mapBuilder.map.getView().setCenter(mapcontext.center);
                    mapBuilder.map.getView().setZoom(mapcontext.zoom);

                    let layerTree = [];

                    // Load layers if present
                    if(mapcontext.layers.length > 0){
                        for (var k = 0; k < mapcontext.layers.length; k++) {
                            var layerContext = mapcontext.layers[k];

                            var newLayer = new ImageLayer({
                                title: layerContext.title,
                                repositoryId: layerContext.repositoryId,
                                projectId: layerContext.projectId,
                                projectName: layerContext.projectName,
                                elementColor: layerContext.elementColor,
                                opacity: layerContext.opacity,
                                bbox: layerContext.bbox,
                                popup: layerContext.popup,
                                visible: layerContext.visible,
                                zIndex: layerContext.zIndex,
                                minResolution: layerContext.minResolution,
                                maxResolution: layerContext.maxResolution != null ? layerContext.maxResolution : Infinity,
                                source: new ImageWMS({
                                    url: lizUrls.wms+'?repository=' + layerContext.repositoryId + '&project=' + layerContext.projectId,
                                    params: {
                                        'LAYERS': layerContext.name,
                                        'STYLES': layerContext.style
                                    },
                                    serverType: 'qgis'
                                })
                            });

                            mapBuilder.map.addLayer(newLayer);
                        }
                        layerTree = refreshLayerSelected();
                    }
                    updateFromLayerTree(layerTree)
                }
            });

            return false;
        });
    }

    /**
     * Set the content of the map context container
     * @param {string} mcData HTML content
     */
    function setMapContextContent( mcData ){
    // set content
        $('#mapcontext-container').html(mcData);
        // unbind previous click events
        $('#mapcontext-container button').unbind('click');
        // Bind events
        bindMapContextEvents();
        // Remove bname val
        $('#mapcontext-name').val('').blur();
    }

    $('#attribute-btn').on("click", function(){
        if($('#attribute-layers-content').text().trim() != ""){
            $('#bottom-dock').show();
            $(this).addClass('active');
        }
    });

    // Disable tooltip on focus
    $('[data-toggle="tooltip"]').tooltip({
        'trigger': 'hover'
    });
});
