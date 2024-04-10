// it is important to set global var before any imports
__webpack_public_path__ = lizUrls.basepath+'mapBuilder/js/';

import $ from 'jquery';

import 'ol/ol.css';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {defaults as defaultControls, Control, ScaleLine} from 'ol/control.js';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';

import OSM from 'ol/source/OSM.js';
import StadiaMaps from 'ol/source/StadiaMaps.js';
import BingMaps from 'ol/source/BingMaps.js';
import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import {getWidth} from 'ol/extent.js';

import WMSCapabilities from 'ol/format/WMSCapabilities.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import {transformExtent, get as getProjection} from 'ol/proj.js';

import {DragZoom} from 'ol/interaction.js';
import {always as alwaysCondition, shiftKeyOnly as shiftKeyOnlyCondition} from 'ol/events/condition.js';

import './modules/bottom-dock.js';

// Extent on metropolitan France if not defined in mapBuilder.ini.php
var originalCenter = [217806.92414447578, 5853470.637803803];
var originalZoom = 6;

// 1 inch = 2,54 cm = 25,4 mm
const INCHTOMM = 25.4;

// Disable fancytree logs in production mode
if (PRODUCTION) {
  $.ui.fancytree.debugLevel = 0;
}

$(function() {

    function performCleanName(aName) {
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

    function mAddMessage(aMessage, aType, aClose, aTimer) {
        var mType = 'info';
        var mTypeList = ['info', 'danger', 'success'];
        var mClose = false;
        var mDismissible = '';

        if (mTypeList.indexOf(aType) !== -1)
            mType = aType;

        if (aClose) {
            mClose = true;
            mDismissible = 'alert-dismissible';
        }

        var html = '<div class="alert alert-' + mType + ' ' + mDismissible + ' fade show" role="alert">';

        html += aMessage;

        if (mClose) {
            html += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                <span aria-hidden="true">&times;</span>\
              </button>';
        }

        html += '</div>';

        var elt = html;
        document.querySelector('#message').insertAdjacentHTML("beforeend", elt);

        if (aTimer !== undefined) {
            setTimeout(function () {
                var alertElement = document.querySelector(".alert");
                if (alertElement !== null) {
                    alertElement.classList.remove("show");
                }
            }, aTimer);
        }

        return elt;
    }

    function buildLayerTree(layer, cfg) {
        var myArray = [];
        if (Array.isArray(layer)) {
            layer.forEach(function (sublayer) {
                // Layer name is used as a key in lizmap config
                var sublayerName = sublayer.Name;

                // If key is not present, it might because a shortname has been defined in QGIS
                if (!cfg.layers.hasOwnProperty(sublayer.Name)) {
                    for (var key in cfg.layers) {
                        if (cfg.layers[key].hasOwnProperty('shortname') && (cfg.layers[key].shortname == sublayer.Name)) {
                            sublayerName = cfg.layers[key].name;
                        }
                    }
                }
                // Filter layers in Hidden and Overview directory
                if (sublayer.hasOwnProperty('Title') && (sublayer.Title.toLowerCase() == 'hidden' || sublayer.Title.toLowerCase() == 'overview')) {
                    return;
                }
                // Filter layers not visible in legend or without geometry
                if (sublayer.hasOwnProperty('Name') && cfg.layers.hasOwnProperty(sublayerName)
                    && (cfg.layers[sublayerName].displayInLegend == 'False' || cfg.layers[sublayerName].geometryType == 'none')) {
                    return;
                }
                var layers = buildLayerTree(sublayer, cfg);
                myArray = myArray.concat(layers);
            });
            return myArray;
        }

        // Layer name is used as a key in lizmap config
        var layerName = layer.Name;

        // If key is not present, it might because a shortname has been defined in QGIS
        if (!cfg.layers.hasOwnProperty(layer.Name)) {
            for (var key in cfg.layers) {
                if (cfg.layers[key].hasOwnProperty('shortname') && (cfg.layers[key].shortname == layer.Name)) {
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
                && cfg.attributeLayers[layerName].hideLayer != "True"
                && cfg.attributeLayers[layerName].pivot != "True") {
                myObj.hasAttributeTable = true;
            }
            if (cfg.layers.hasOwnProperty(layerName)
                && cfg.layers[layerName].abstract != "") {
                myObj.tooltip = cfg.layers[layerName].abstract;
            }
            myArray.push(myObj);
        }

        // Layer has children and is not a group as layer => folder
        if (layer.hasOwnProperty('Layer') && cfg.layers[layerName].groupAsLayer == 'False') {
            myObj.folder = true;
            myObj.children = buildLayerTree(layer.Layer, cfg);
        }
        return myArray;
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

        if ($.ui.fancytree.getTree("#layerSelected") !== null) {
            $.ui.fancytree.getTree("#layerSelected").reload(layerTree);
        }

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
      // Display if not empty
      if(popupHTML != ''){
        // Show popup tab
        $('#popup-display-tab').removeClass('d-none');
        $('#popup-display-tab').tab('show');
        $('#popup-display-tab').focus();
      }else{
        if($('#popup-display').hasClass('active')){
          $('#popup-display-tab').addClass('d-none');
          $("#dock").hide();
        }
      }
    });
  });

  $('#layerStore').fancytree({
    selectMode: 3,
    source: mapBuilder.layerStoreTree,
    extensions: ["table", "glyph"],
    table: {
      indentation: 20,      // indent 20px per node level
      nodeColumnIdx: 0     // render the node title into the first column
    },
    glyph: {
        // The preset defines defaults for all supported icon types.
        // It also defines a common class name that is prepended (in this case 'fa ')
        preset: "awesome5",
        map: {
          doc: "fas fa-globe-africa",
          docOpen: "fas fa-globe-africa",
          folder: "fas fa-folder",
          folderOpen: "fas fa-folder-open"
        }
      },
    lazyLoad: function(event, data) {
      //https://github.com/mar10/fancytree/wiki/TutorialLoadData
      var repositoryId = data.node.data.repository;
      var projectId = data.node.data.project;
      var url = lizUrls.wms+"?repository=" + repositoryId + "&project=" + projectId + "&SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0";
      var parser = new WMSCapabilities();

      const promises = [
        new Promise(resolve =>
          $.get(url, function(capabilities) {
            var result = parser.read(capabilities);
            if (result.hasOwnProperty('Capability')){
              var node = result.Capability;

              if (node.hasOwnProperty('Layer')) {
                // First layer is in fact project
                if (node.Layer.hasOwnProperty('Layer')) {
                  resolve(node.Layer.Layer);
                } else { // Should not happen
                  resolve(node.Layer);
                }
              }
            }else{
              resolve(false);
            }
          })
        ),
        new Promise(resolve =>
          $.getJSON(lizUrls.config,{"repository":repositoryId,"project":projectId},function(cfgData) {
            if (cfgData){
              resolve(cfgData);
            }else{
              resolve(false);
            }
          })
        )
      ];

      data.result = Promise.all(promises).then(results => {
        if(! mapBuilder.hasOwnProperty('lizMap')){
          mapBuilder.lizMap = {};
        }

        if (results[0] && results[1]){
          // Cache project config for later use
          mapBuilder.lizMap[repositoryId + '|' + projectId] = {};
          mapBuilder.lizMap[repositoryId + '|' + projectId].config = results[1];

          return buildLayerTree(results[0], results[1]);
        }else{
          // Return empty array when errors
          return [];
        }
      });
    },
    renderColumns: function(event, data) {
      var node = data.node,
      $tdList = $(node.tr).find(">td");

      // Style list
      if(node.data.hasOwnProperty('style')){
        var styleOption = "";
        node.data.style.forEach(function(style) {
          styleOption += "<option>"+style.Name+"</option>";
        });
        $tdList.eq(1).html("<select class='layerStyles custom-select custom-select-sm'>"+styleOption+"</select>");
      }
      // Add button for layers (level 1 => repositories, 2 => projects)
      if(node.getLevel() > 2 && node.children == null){
        $tdList.eq(2).html("<button type='button' class='addLayerButton btn btn-sm'><i class='fas fa-plus'></i></button>");
      }
    }
  });

  /* Handle custom addLayerButton clicks */
  $('#layerStore').on("click", ".addLayerButton", function(e){
    var node = $.ui.fancytree.getNode(e);

    var parentList = node.getParentList();
    // We get repositoryId and projectId from parents node in the tree
    var repositoryId = parentList[1].data.repository;
    var projectId = parentList[1].data.project;

    var newLayer = new ImageLayer({
      title: node.title,
      repositoryId: repositoryId,
      projectId: projectId,
      bbox: node.data.bbox,
      popup: node.data.popup,
      hasAttributeTable: node.data.hasAttributeTable,
      source: new ImageWMS({
        url: lizUrls.wms+'?repository=' + repositoryId + '&project=' + projectId,
        params: {
          'LAYERS': node.data.name,
          'STYLES': $(node.tr).find(">td .layerStyles :selected").text()
        },
        serverType: 'qgis'
      })
    });

    // Set min/max resolution if min/max scale are defined in getCapabilities
    if(node.data.hasOwnProperty('minScale')){
      newLayer.setMinResolution(node.data.minScale * INCHTOMM / (1000 * 90 * window.devicePixelRatio));
    }
    if(node.data.hasOwnProperty('maxScale')){
      newLayer.setMaxResolution(node.data.maxScale * INCHTOMM / (1000 * 90 * window.devicePixelRatio));
    }

    var maxZindex = -1;
    // Get maximum Z-index to put new layer at top of the stack
    mapBuilder.map.getLayers().forEach(function(layer) {
      var zIndex = layer.getZIndex();
      if(zIndex !== undefined && zIndex > maxZindex){
        maxZindex = zIndex;
      }
    });

    if(maxZindex > -1){
      newLayer.setZIndex(maxZindex + 1);
    }else{
      newLayer.setZIndex(0);
    }

    // Show layer is loading
    newLayer.getSource().on('imageloadstart', function(event) {
      $('#layers-loading').prepend('\
        <span class="spinner-grow spinner-grow-sm" title="'+lizDict['selector.layers.loading']+'..." role="status">\
          <span class="sr-only">'+lizDict['selector.layers.loading']+'...</span>\
        </span>');
    });

    // Show layer had loaded
    newLayer.getSource().on('imageloadend', function(event) {
      $('#layers-loading > .spinner-grow:first').remove();
    });

    mapBuilder.map.addLayer(newLayer);
    refreshLayerSelected();
    e.stopPropagation();  // prevent fancytree activate for this row
  });


  $('#layerSelected').fancytree({
      extensions: ["dnd5", "table"],
      table: {
        indentation: 20,      // indent 20px per node level
        nodeColumnIdx: 0     // render the node title into the first column
      },
      dnd5: {
          dragStart: function() {
            return true;
          },
          dragDrop: function(node, data) {
            if (data.otherNode) {
              data.otherNode.moveTo(node, data.hitMode);
            }
            // Parcourt de la liste des nodes pour mettre à jour le Z-index des couches
            var allNodes = node.parent.children;

            for (var i = 0; i < allNodes.length; i++) {
              var layers = mapBuilder.map.getLayers().getArray();
              for (var j = 0; j < layers.length; j++) {
                if (allNodes[i].data.ol_uid == layers[j].ol_uid) {
                  layers[j].setZIndex(allNodes.length - i);
                }
              }
            }
            // Refresh legends
            loadLegend();
          },
          dragEnter: function() {
            // Don't allow dropping *over* a node (would create a child). Just
            // allow changing the order:
            return ["before", "after"];
          }
      },
      renderColumns: function(event, data) {
        var node = data.node;
        var nodeRow = $(node.tr);
        nodeRow.find(".layerSelectedStyles").text(node.data.styles);

        var opacity = 0;
        var visible = true;

        var layers = mapBuilder.map.getLayers().getArray();
        for (var i = 0; i < layers.length; i++) {
          if(layers[i].ol_uid == node.data.ol_uid){
            opacity = layers[i].getOpacity();
            visible = layers[i].getVisible();
          }
        }

        nodeRow.find(".deleteLayerButton").html("<button class='btn btn-sm'><i class='fas fa-trash'></i></button>");

        if(visible){
          nodeRow.find(".toggleVisibilityButton").html("<button class='btn btn-sm'><i class='fas fa-eye'></i></button>");
        }else{
          nodeRow.find(".toggleVisibilityButton").html("<button class='btn btn-sm'><i class='fas fa-eye-slash'></i></button>");
        }

        nodeRow.find(".zoomToExtentButton").html("<button class='btn btn-sm'><i class='fas fa-search-plus'></i></button>");

        // Add button to display layer's attribute table if eligible
        if(nodeRow.find(".displayDataButton").length == 1 && node.data.hasOwnProperty('hasAttributeTable') && node.data.hasAttributeTable !== undefined){
          var disabled = '';

          if($("#attributeLayersTabs .nav-link [data-ol_uid='"+node.data.ol_uid+"']").length != 0){
            disabled = 'disabled';
          }

          nodeRow.find(".displayDataButton").html("<button type='button' "+disabled+" class='attributeLayerButton btn btn-sm'><i class='fas fa-list-ul'></i></button>");
        }

        nodeRow.find(".changeOrder").html("<div class='fas fa-caret-up changeOrder changeOrderUp'></div><div class='fas fa-caret-down changeOrder changeOrderDown'></div>");
        nodeRow.find(".toggleInfos").html("<button class='btn btn-sm'><i class='fas fa-info'></i></button>");

        var buttons = "";
        for (var i = 1; i < 6; i++) {
          var active = opacity == (i*20)/100 ? "active" : "";
          buttons += "<button type='button' class='btn "+active+"'>"+(i*20)+"</button>";
        }

        nodeRow.find(".changeOpacityButton").html('<div class="btn-group btn-group-sm" role="group" aria-label="Opacity">'+buttons+'</div>');

        if($(".layerSelectedStyles:visible").length > 0){
          $("#layerSelected td.hide").show();
        }else{
          $("#layerSelected td.hide").hide();
        }
      }
  });

  $('#layerSelected').on("click", ".deleteLayerButton button", function(e){
    var node = $.ui.fancytree.getNode(e);

    var layers = mapBuilder.map.getLayers().getArray();
    for (var i = 0; i < layers.length; i++) {
      if(layers[i].ol_uid == node.data.ol_uid){
        mapBuilder.map.removeLayer(layers[i]);
      }
    }
    refreshLayerSelected();
    e.stopPropagation();  // prevent fancytree activate for this row
  });

  // Toggle layer visibility
  $('#layerSelected').on("click", ".toggleVisibilityButton button", function(e){
    var node = $.ui.fancytree.getNode(e);

    var layers = mapBuilder.map.getLayers().getArray();
    for (var i = 0; i < layers.length; i++) {
      if(layers[i].ol_uid == node.data.ol_uid){
        if(layers[i].getVisible()){
          layers[i].setVisible(false);
          $(this).find('i').removeClass('fa-eye').addClass('fa-eye-slash');
        }else{
          layers[i].setVisible(true);
          $(this).find('i').removeClass('fa-eye-slash').addClass('fa-eye');
        }
      }
    }
    e.stopPropagation();  // prevent fancytree activate for this row
  });

  $('#layerSelected').on("click", ".zoomToExtentButton button", function(e){
    var node = $.ui.fancytree.getNode(e);

    var layers = mapBuilder.map.getLayers().getArray();
    for (var i = 0; i < layers.length; i++) {
      if(layers[i].ol_uid == node.data.ol_uid){
        mapBuilder.map.getView().fit(transformExtent(layers[i].getProperties().bbox, 'EPSG:4326', mapBuilder.map.getView().getProjection()));
      }
    }
    e.stopPropagation();  // prevent fancytree activate for this row
  });

  $('#layerSelected').on("click", ".attributeLayerButton", function(e){
    $('#attribute-btn').addClass("active");

    // Disable button to avoid multiple calls
    $(this).prop("disabled",true);

    var node = $.ui.fancytree.getNode(e);

    var layerName = performCleanName(node.data.name);
    var repositoryId = node.data.repositoryId;
    var projectId = node.data.projectId;

    const promises = [
      new Promise(resolve =>
        // GetFeature request
        $.getJSON(lizUrls.wms, {
           'repository':repositoryId
          ,'project':projectId
          ,'SERVICE':'WFS'
          ,'REQUEST':'GetFeature'
          ,'VERSION':'1.0.0'
          ,'TYPENAME':layerName
          ,'OUTPUTFORMAT': 'GeoJSON'
          ,'GEOMETRYNAME': 'extent'
        }, function(features) {
          resolve(features);
        })
      ),
      new Promise(resolve =>
        // DescribeFeatureType request to get aliases
        $.getJSON(lizUrls.wms, {
           'repository':repositoryId
          ,'project':projectId
          ,'SERVICE':'WFS'
          ,'VERSION':'1.0.0'
          ,'REQUEST':'DescribeFeatureType'
          ,'TYPENAME':layerName
          ,'OUTPUTFORMAT':'JSON'
        }, function(describe) {
          resolve(describe);
        })
      )
    ];

    Promise.all(promises).then(results => {
      // TODO : cache results
      var features = results[0].features;
      var aliases = results[1].aliases;

      // Show only WFS-published and non hidden properties
      var propertiesFromWFS = features[0].properties;
      var visibleProperties = [];

      if(mapBuilder.lizMap[repositoryId + '|' + projectId].config.attributeLayers[node.data.name].hasOwnProperty('attributetableconfig')){
        var columns = mapBuilder.lizMap[repositoryId + '|' + projectId].config.attributeLayers[node.data.name].attributetableconfig.columns.column;
      }

      if(columns !== undefined){
        for (var i = 0; i < columns.length; i++) {
          if(propertiesFromWFS.hasOwnProperty(columns[i].attributes.name) && columns[i].attributes.hidden == "0"){
            visibleProperties.push(columns[i].attributes.name);
          }
        }
      }else{
        for (var property in propertiesFromWFS) {
          visibleProperties.push(property);
        }
      }

      var attributeHTMLTable = '<table class="table">';

      // Add table header
      attributeHTMLTable += '<tr><th></th>';
      for (var i = 0; i < visibleProperties.length; i++) {
        var columnName = aliases[visibleProperties[i]] != "" ? aliases[visibleProperties[i]] : visibleProperties[i];
        attributeHTMLTable += '<th>'+ columnName +'</th>';
      }
      attributeHTMLTable += '</tr>';

      // Add data
      for (var i = 0; i < features.length; i++) {
        var feature = features[i];

        attributeHTMLTable += '<tr><td><button type="button" title="'+lizDict['zoomin']+'" class="btn btn-sm zoomToFeatureExtent" data-feature-extent="'+JSON.stringify(feature.bbox)+'"><i class="fas fa-search-plus"></i></button></td>';
        for (var j = 0; j < visibleProperties.length; j++) {
          var propertieValue = feature.properties[visibleProperties[j]];

          // Replace url or media by link
          if(typeof propertieValue === 'string'){
            if( propertieValue.substr(0,6) == 'media/' || propertieValue.substr(0,6) == '/media/' ){
                var rdata = propertieValue;
                if( propertieValue.substr(0,6) == '/media/' )
                    rdata = propertieValue.slice(1);
                propertieValue = '<a href="' + lizUrls.media + '?repository='+repositoryId+'&project='+projectId+'&path=/' + rdata + '" target="_blank">'+aliases[visibleProperties[j]]+'</a>';
            }
            else if( propertieValue.substr(0,4) == 'http' || propertieValue.substr(0,3) == 'www' ){
                var rdata = propertieValue;
                if(propertieValue.substr(0,3) == 'www')
                    rdata = 'http://' + propertieValue;
                propertieValue = '<a href="' + rdata + '" target="_blank">' + propertieValue + '</a>';
            }
          }
          attributeHTMLTable += '<td>'+ propertieValue +'</td>';
        }
        attributeHTMLTable += '</tr>';
      }

      attributeHTMLTable += '</table>';

      // Hide other tabs before appending
      $('#attributeLayersTabs .nav-link').removeClass('active');
      $('#attributeLayersContent .tab-pane').removeClass('show active');

      $('#attributeLayersTabs').append('\
          <li class="nav-item">\
            <a class="nav-link active" href="#attributeLayer-'+repositoryId+'-'+projectId+'-'+layerName+'" role="tab">'+node.title+'&nbsp;<i data-ol_uid="' + node.data.ol_uid + '" class="fas fa-times"></i></a>\
          </li>'
        );

      $('#attributeLayersContent').append('\
          <div class="tab-pane fade show active" id="attributeLayer-'+repositoryId+'-'+projectId+'-'+layerName+'" role="tabpanel">\
            <div class="table">\
            '+attributeHTMLTable+'\
            </div>\
          </div>'
        );

      $('#attributeLayersTabs a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
      });

      // Handle close tabs
      $('#attributeLayersTabs .fa-times').on('click', function (e) {
        e.preventDefault();

        var isActiveTab = $(this).closest('a').hasClass('active');
        var previousTab = $(this).closest('li').prev();
        var nextTab = $(this).closest('li').next();

        // Remove tab and its content
        var parentId = $(this).closest('a').attr('href');
        $(parentId).remove();
        $(this).closest('li').remove();

        // Enable attribute table button
        var ol_uid = $(this).data('ol_uid');
        $.ui.fancytree.getTree("#layerSelected").visit(function(node){
          if(node.data.ol_uid == ol_uid){
            $(node.tr).find(".attributeLayerButton").prop("disabled",false);
          }
        });

        // Hide bottom dock
        if($('#attributeLayersContent').html().trim() == ""){
          $('#bottom-dock').hide();
          $('#attribute-btn').removeClass("active");
        }

        // Active another sibling tab if current was active
        if(isActiveTab){
          if(nextTab.length > 0){
            nextTab.find('.nav-link').tab('show');
          }else{
            previousTab.find('.nav-link').tab('show');
          }
        }
      });

      // Handle zoom to feature extent
      $('.zoomToFeatureExtent').on('click', function () {
        var bbox = $(this).data('feature-extent');
        mapBuilder.map.getView().fit(transformExtent(bbox, 'EPSG:4326', mapBuilder.map.getView().getProjection()));
      });

      $('#bottom-dock').show();
    });
  });

  $('#layerSelected').on("click", ".toggleInfos button", function(e){
    $(this).parent().nextAll().toggle();

    if($(".layerSelectedStyles:visible").length > 0){
      $("#layerSelected th.hide").show();
    }else{
      $("#layerSelected th.hide").hide();
    }

    e.stopPropagation();  // prevent fancytree activate for this row
  });

  $('#layerSelected').on("click", ".changeOpacityButton div button", function(e){
    var node = $.ui.fancytree.getNode(e);
    var opacity = e.target.textContent;

    var layers = mapBuilder.map.getLayers().getArray();
    for (var i = 0; i < layers.length; i++) {
      if(layers[i].ol_uid == node.data.ol_uid){
        layers[i].setOpacity(opacity/100);
      }
    }
    // UI
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
    e.stopPropagation();  // prevent fancytree activate for this row
  });

  // Handle zIndex up and down events
  $('#layerSelected').on("click", ".changeOrder", function(e){
    var node = $.ui.fancytree.getNode(e);
    var siblingNode = $(this).hasClass("changeOrderUp") ? node.getPrevSibling() : node.getNextSibling();

    if(siblingNode){
      var nodeLayerZIndex = -1;
      var siblingNodeLayerZIndex = -1;

      var layers = mapBuilder.map.getLayers().getArray();

      for (var i = 0; i < layers.length; i++) {
        if(layers[i].ol_uid == node.data.ol_uid){
          nodeLayerZIndex = layers[i].getZIndex();
        }
        if(layers[i].ol_uid == siblingNode.data.ol_uid){
          siblingNodeLayerZIndex = layers[i].getZIndex();
        }
      }

      // Swap zIndex
      for (var i = 0; i < layers.length; i++) {
        if(layers[i].ol_uid == node.data.ol_uid){
          layers[i].setZIndex(siblingNodeLayerZIndex);
        }
        if(layers[i].ol_uid == siblingNode.data.ol_uid){
          layers[i].setZIndex(nodeLayerZIndex);
        }
      }

      refreshLayerSelected();
    }
    e.stopPropagation();  // prevent fancytree activate for this row
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

  $('#pdf-print-btn').on("click", function(){

    $(this).addClass("disabled");
    document.body.style.cursor = 'progress';

    import(/* webpackChunkName: "jspdf" */ 'jspdf' ).then(({ default: jsPDF }) => {
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
      const width = Math.round(dim[0] * resolution / INCHTOMM);
      const height = Math.round(dim[1] * resolution / INCHTOMM);
      const size = mapBuilder.map.getSize();
      const viewResolution = mapBuilder.map.getView().getResolution();

      // Note that when using import() on ES6 modules you must reference the .default property as it's the actual module object that will be returned when the promise is resolved.
      // => https://webpack.js.org/guides/lazy-loading/
      const pdf = new jsPDF('landscape', 'mm', format);
      // Add title
      pdf.setFontSize(18);
      pdf.text($('#pdf-print-title').val(), 50, 10);

      let offset = 25;
      let maxWidthLegend = 0;

      document.querySelectorAll("#legend img").forEach(function (legend) {
        pdf.addImage(legend, 'PNG', 0, offset * INCHTOMM/resolution);
        offset += legend.height;

        if(legend.width > maxWidthLegend){
          maxWidthLegend = legend.width;
        }
      });

      mapBuilder.map.once('rendercomplete', function () {
        const mapCanvas = document.createElement('canvas');
        mapCanvas.width = width;
        mapCanvas.height = height;
        const mapContext = mapCanvas.getContext('2d');
        document.querySelectorAll('.ol-layer canvas').forEach(function (canvas) {
          if (canvas.width > 0) {
            const transform = canvas.style.transform;
            // Get the transform parameters from the style's transform matrix
            const matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);
            // Apply the transform to the export map context
            CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
            mapContext.drawImage(canvas, 0, 0);
          }
        });
        pdf.addImage(mapCanvas.toDataURL('image/jpeg'), 'JPEG', maxWidthLegend * INCHTOMM/resolution, 20, dim[0], dim[1]);
        pdf.save('map.pdf');
        // Reset original map size
        mapBuilder.map.setSize(size);
        mapBuilder.map.getView().setResolution(viewResolution);
        document.body.style.cursor = 'auto';
      });

      // Set print size
      const printSize = [width - maxWidthLegend, height];
      mapBuilder.map.setSize(printSize);
      const scaling = Math.min(width / size[0], height / size[1]);
      mapBuilder.map.getView().setResolution(viewResolution / scaling);
    });
    $(this).removeClass("disabled");
  });


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
          var layers = mapBuilder.map.getLayers().array_;
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
    if($('#attributeLayersContent').html().trim() != ""){
      $('#bottom-dock').show();
      $(this).addClass('active');
    }
  });

  // Disable tooltip on focus
  $('[data-toggle="tooltip"]').tooltip({
     'trigger': 'hover'
  });
});
