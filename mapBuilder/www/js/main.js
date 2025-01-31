// it is important to set global var before any imports
__webpack_public_path__ = lizUrls.basepath+'mapBuilder/js/';

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
import {addElementToLayerArray} from "./modules/LayerSelection/LayerSelection.js";
import {CustomProgress} from "./components/inkmap/ProgressBar";

import {getJobStatus, queuePrint} from './dist/inkmap.js';

// Extent on metropolitan France if not defined in mapBuilder.ini.php
var originalCenter = [217806.92414447578, 5853470.637803803];
var originalZoom = 6;

// 1 inch = 2,54 cm = 25,4 mm
const INCHTOMM = 25.4;

$(function() {

    function mAddMessage( aMessage, aType, aClose, aTimer ) {
        var mType = 'info';
        var mTypeList = ['info', 'danger', 'success'];
        var mClose = false;
        var mDismissible = '';

        if ( $.inArray(aType, mTypeList) != -1 )
            mType = aType;

        if ( aClose ){
            mClose = true;
            mDismissible = 'alert-dismissible';
        }

        var html = '<div class="alert alert-'+mType+' '+mDismissible+' fade show" role="alert">';

        html += aMessage;

        if ( mClose ){
            html += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                <span aria-hidden="true">&times;</span>\
              </button>';
        }

        html += '</div>';

        var elt = $(html);
        $('#message').append(elt);

        if(aTimer !== undefined){
            setTimeout(function() {
                $(".alert").alert('close');
            }, aTimer);
        }

        return elt;
    }

    // refresh #layerSelected tree to reflect OL layer's state
    function refreshLayerSelected() {
        var layerTree = [];
        mapBuilder.map.getLayers().forEach(function (layer) {
            // Don't add base layer
            if (!layer.getProperties().hasOwnProperty('baseLayer')) {
                var layerObject = {
                    repositoryId: layer.getProperties().repositoryId,
                    projectId: layer.getProperties().projectId,
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
    mapBuilder.map.getView().fit(transformExtent(mapBuilder.extent, 'EPSG:4326', mapBuilder.map.getView().getProjection()));

    originalCenter = mapBuilder.map.getView().getCenter();
    originalZoom = mapBuilder.map.getView().getZoom();
  }

  function onMoveEnd(evt) {
    if(document.querySelector(".ol-drag-zoom").classList.contains("active")){
      document.querySelector(".ol-drag-zoom.active").classList.remove("active");

      evt.map.getInteractions().forEach(function(interaction) {
        if(interaction instanceof DragZoom){
          interaction.condition_ = shiftKeyOnlyCondition;
        }
      });
    }
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

  //Build the tree
  var listTree = [];

  var layerStore;

  layerStore = new LayerStore(document.getElementById("layer-store-holder"));

  listTree = layerStore.getTree();

  /**
   * Get the Layer node from its UUID
   * @param {string} uuid Layer's UUID.
   * @return {LayerTreeLayer|-1} Node or -1 if not found.
   */
  function getNodeFromUuid(uuid) {
    for (var i = 0; i < listTree.length; i++) {
      var node = layerStore.getNode(uuid, listTree[i]);
      if (node !== -1) {
        return node;
      }
    }
    return -1;
  }

  /* Handle custom addLayerButton clicks */
  document.querySelector('#layer-store-holder').addEventListener('click', function (e) {
    if (e.target.closest('.layer-store-layer') && e.target.tagName !== "SELECT") {
      var element = e.target.closest('.layer-store-layer');

      var node = getNodeFromUuid(element.id);
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
      newLayer.getSource().on('imageloadstart', function (event) {
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
      newLayer.getSource().on('imageloadend', function (event) {
        document.querySelector("#layers-loading > .spinner-grow:first-child").remove();
      });

      mapBuilder.map.addLayer(newLayer);
      refreshLayerSelected();

      addElementToLayerArray(newLayer, element.style.backgroundColor);

      mAddMessage(lizDict['layer.added'], 'success', true, 1000);
    }
  });

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
   * @return {ImageLayer[]}
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
     * @return {*}
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

          // Load layers if present
          if(mapcontext.layers.length > 0){
            for (var i = 0; i < mapcontext.layers.length; i++) {
              var layerContext = mapcontext.layers[i];

              var newLayer = new ImageLayer({
                title: layerContext.title,
                repositoryId: layerContext.repositoryId,
                projectId: layerContext.projectId,
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
            refreshLayerSelected();
          }
        }
      });

      return false;
    });
  }

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

  $('#attribute-btn').on("click", function(e){
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
