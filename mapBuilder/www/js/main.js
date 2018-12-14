import $ from 'jquery';

import * as jsPDF from 'jspdf'

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {defaults as defaultControls, Control, ScaleLine} from 'ol/control.js';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import OSM from 'ol/source/OSM.js';
import WMSCapabilities from 'ol/format/WMSCapabilities.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import {transformExtent,Projection} from 'ol/proj.js';

import {defaults as defaultInteractions, DragZoom} from 'ol/interaction.js';
import {always as alwaysCondition, shiftKeyOnly as shiftKeyOnlyCondition} from 'ol/events/condition.js';

// Extent on France if not defined in mapBuilder.ini.php
var originalCenter = [217806.92414447578, 5853470.637803803];
var originalZoom = 6;

// 1 inch = 2,54 cm = 25,4 mm
const INCHTOMM = 25.4;

$(function() {

  function buildLayerTree(layer, cfg) {
    var myArray = [];
    if (Array.isArray(layer)) {
        layer.forEach(function(sublayer) {
          // Filter layers in Hidden and Overview directory
          if(sublayer.hasOwnProperty('Title') && (sublayer.Title.toLowerCase() == 'hidden' || sublayer.Title.toLowerCase() == 'overview')){
            return;
          }
          // Filter layers not visible in legend or without geometry
          if(sublayer.hasOwnProperty('Name') && cfg.layers.hasOwnProperty(sublayer.Name)
            && (cfg.layers[sublayer.Name].displayInLegend == 'False' || cfg.layers[sublayer.Name].geometryType == 'none')){
              return;
          }
          var layers = buildLayerTree(sublayer, cfg);
          myArray = myArray.concat(layers);
        });
        return myArray;
    }

    var myObj = { title: cfg.layers[layer.Name].title, name : layer.Name, popup : cfg.layers[layer.Name].popup};
    if(layer.hasOwnProperty('Style')){
      myObj.style = layer.Style;
    }
    if(layer.hasOwnProperty('EX_GeographicBoundingBox')){
      myObj.bbox = layer.EX_GeographicBoundingBox;
    }
    if(layer.hasOwnProperty('MinScaleDenominator') && layer.MinScaleDenominator !== undefined){
      myObj.minScale = layer.MinScaleDenominator;
    }
    if(layer.hasOwnProperty('MaxScaleDenominator') && layer.MaxScaleDenominator !== undefined){
      myObj.maxScale = layer.MaxScaleDenominator;
    }
    myArray.push(myObj);
    // Layer has children and is not a group as layer => folder
    if (layer.hasOwnProperty('Layer') && cfg.layers[layer.Name].groupAsLayer == 'False') {
        myObj.folder = true;
        myObj.children = buildLayerTree(layer.Layer, cfg);
    }
    return myArray;
  }

  // refresh #layerSelected tree to reflect OL layer's state
  function refreshLayerSelected() {
      var layerTree = [];
      mapBuilder.map.getLayers().forEach(function(layer) {
        // Don't add OSM
        if(layer.getProperties().title != "OSM"){
          var layerObject = {
            title: layer.getProperties().title,
            styles: layer.getSource().getParams().STYLES,
            ol_uid: layer.ol_uid
          };

          if(layer.getZIndex() !== undefined){
            layerTree[layer.getZIndex()] = layerObject;
          }/*else{
            layerTree.push(layerObject);
          }*/
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
      // TODO : improve loadLegend to avoid multiple getLegendGraphic requests
      loadLegend();
  }

  var dragZoomControl = (function (Control) {
    function dragZoomControl(opt_options) {
      var options = opt_options || {};

      var button = document.createElement('button');
      button.className = 'fas fa-square';
      button.title = 'Zoomer par rectangle';

      var element = document.createElement('div');
      element.className = 'ol-drag-zoom ol-unselectable ol-control';
      element.appendChild(button);

      Control.call(this, {
        element: element,
        target: options.target
      });

      button.addEventListener('click', this.handleDragZoom.bind(this), false);
    }

    if ( Control ) dragZoomControl.__proto__ = Control;
    dragZoomControl.prototype = Object.create( Control && Control.prototype );
    dragZoomControl.prototype.constructor = dragZoomControl;

    dragZoomControl.prototype.handleDragZoom = function handleDragZoom () {
      if($(this.element).hasClass('active')){
        $(this.element).removeClass('active');

        this.getMap().getInteractions().forEach(function(interaction) {
          if(interaction.constructor.name === "DragZoom"){
            interaction.condition_ = shiftKeyOnlyCondition;
          }
        });
      }else{
        $(this.element).addClass('active');

        this.getMap().getInteractions().forEach(function(interaction) {
          if(interaction.constructor.name === "DragZoom"){
            interaction.condition_ = alwaysCondition;
          }
        });
      }
    };

    return dragZoomControl;
  }(Control));

  var zoomToOriginControl = (function (Control) {
    function zoomToOriginControl(opt_options) {
      var options = opt_options || {};

      var button = document.createElement('button');
      button.className = 'fas fa-expand-arrows-alt';
      button.title = 'Zoomer sur l\'étendue initiale';

      var element = document.createElement('div');
      element.className = 'ol-zoom-origin ol-unselectable ol-control';
      element.appendChild(button);

      Control.call(this, {
        element: element,
        target: options.target
      });

      button.addEventListener('click', this.handleZoomToOrigin.bind(this), false);
    }

    if ( Control ) zoomToOriginControl.__proto__ = Control;
    zoomToOriginControl.prototype = Object.create( Control && Control.prototype );
    zoomToOriginControl.prototype.constructor = zoomToOriginControl;

    zoomToOriginControl.prototype.handleZoomToOrigin = function handleZoomToOrigin () {
      this.getMap().getView().setCenter(originalCenter);
      this.getMap().getView().setZoom(originalZoom);
    };

    return zoomToOriginControl;
  }(Control));

  mapBuilder.map = new Map({
    target: 'map',
    controls: defaultControls().extend([
      new ScaleLine(),
      new dragZoomControl(),
      new zoomToOriginControl()
    ]),
    layers: [
      new TileLayer({
        title: "OSM",
        source: new OSM()
      })
    ],
    view: new View({
        center: originalCenter,
        zoom: originalZoom
    })
  });

  // Extent is set in mapBuilder.ini.php => fit view on it and override originalCenter and originalZoom
  if(mapBuilder.hasOwnProperty('extent')){
    mapBuilder.map.getView().fit(transformExtent(mapBuilder.extent, 'EPSG:4326', mapBuilder.map.getView().projection_));

    originalCenter = mapBuilder.map.getView().getCenter();
    originalZoom = mapBuilder.map.getView().getZoom();
  }

  function onMoveEnd(evt) {
    if($(".ol-drag-zoom").hasClass("active")){
      $(".ol-drag-zoom.active").removeClass("active");

      evt.map.getInteractions().forEach(function(interaction) {
        if(interaction.constructor.name === "DragZoom"){
          interaction.condition_ = shiftKeyOnlyCondition;
        }
      });
    }
  }

  mapBuilder.map.on('moveend', onMoveEnd);

  // Handle getFeatureInfo when map is clicked
  mapBuilder.map.on('singleclick', function(evt) {
    document.getElementById('popupcontent').innerHTML = '';
    var viewResolution = mapBuilder.map.getView().getResolution();
    var getFeatureInfos = [];
    var getFeatureInfosIframes = ""

    mapBuilder.map.getLayers().forEach(function(layer) {
      if(layer.type == "IMAGE" && layer.values_.popup == "True"){
        var url = layer.getSource().getGetFeatureInfoUrl(
          evt.coordinate, viewResolution, 'EPSG:3857',
          {'INFO_FORMAT': 'text/html'});

        // Display getFeatureInfos by zIndex order
        if (url) {
          getFeatureInfos[layer.getZIndex()] = url;
        }
      }
    });

    for (var i = getFeatureInfos.length - 1; i >= 0; i--) {
      if(getFeatureInfos[i] !== undefined){
        getFeatureInfosIframes += '<iframe seamless src="' + getFeatureInfos[i] + '"></iframe>';
      }
    }
    document.getElementById('popupcontent').innerHTML = getFeatureInfosIframes;

    // Show popup tab
    $('#popupcontent-tab').tab('show')
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

                var node = result.Capability;

                // First layer is in fact project
                if (node.hasOwnProperty('Layer')) {
                    resolve(node.Layer.Layer);
                }
            })
          ),
          new Promise(resolve => 
            $.getJSON(lizUrls.config,{"repository":repositoryId,"project":projectId},function(cfgData) {
              resolve(cfgData);
            })
          )
        ];

        data.result = Promise.all(promises).then(results => {
          return buildLayerTree(results[0], results[1]);
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
        $tdList.eq(1).html("<select class='layerStyles custom-select-sm'>"+styleOption+"</select>");
      }
      // Add button for layers (level 1 => repositories, 2 => projects)
      if(node.getLevel() > 2 && node.children == null){
        $tdList.eq(2).html("<button type='button' class='addLayerButton btn btn-sm'><i class='fas fa-plus'></i></button>");
      }
    }
  });

  /* Handle custom addLayerButton clicks (http://wwwendt.de/tech/fancytree/demo/#sample-ext-table.html) */
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
      source: new ImageWMS({
        url: '/index.php/lizmap/service/?repository=' + repositoryId + '&project=' + projectId,
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
          dragStart: function(node, data) {
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
          },
          dragEnter: function(node, data) {
              // Don't allow dropping *over* a node (would create a child). Just
              // allow changing the order:
              return ["before", "after"];
          }
      },
      renderColumns: function(event, data) {
        var node = data.node;
        $(node.tr).find(".layerSelectedStyles").text(node.data.styles);

        var opacity = 0;

        var layers = mapBuilder.map.getLayers().getArray();
        for (var i = 0; i < layers.length; i++) {
          if(layers[i].ol_uid == node.data.ol_uid){
            opacity = layers[i].getOpacity();
          }
        }

        $(node.tr).find(".deleteLayerButton").html("<button class='btn btn-sm'><i class='fas fa-trash'></i></button>");
        $(node.tr).find(".zoomToExtentButton").html("<button class='btn btn-sm'><i class='fas fa-search-plus'></i></button>");
        $(node.tr).find(".changeOrder").html("<div class='fas fa-caret-up changeOrder changeOrderUp'></div><div class='fas fa-caret-down changeOrder changeOrderDown'></div>");
        $(node.tr).find(".toggleInfos").html("<button class='btn btn-sm'><i class='fas fa-info'></i></button>");

        var buttons = "";
        for (var i = 1; i < 6; i++) {
          var active = opacity == (i*20)/100 ? "active" : "";
          buttons += "<button type='button' class='btn "+active+"'>"+(i*20)+"</button>";
        }

        $(node.tr).find(".changeOpacityButton").html('<div class="btn-group btn-group-sm" role="group" aria-label="Opacity">'+buttons+'</div>');

        if($(".layerSelectedStyles:visible").length > 0){
          $("#layerSelected th.hide").show();
        }else{
          $("#layerSelected th.hide").hide();
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

  $('#layerSelected').on("click", ".zoomToExtentButton button", function(e){
    var node = $.ui.fancytree.getNode(e);

    var layers = mapBuilder.map.getLayers().getArray();
    for (var i = 0; i < layers.length; i++) {
      if(layers[i].ol_uid == node.data.ol_uid){
        mapBuilder.map.getView().fit(transformExtent(layers[i].values_.bbox, 'EPSG:4326', mapBuilder.map.getView().projection_));
      }
    }
    e.stopPropagation();  // prevent fancytree activate for this row
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
    e.stopPropagation();  // prevent fancytree activate for this row
  });

  function loadLegend(){
    var legends = [];
    var legendsDiv = "";

    mapBuilder.map.getLayers().forEach(function(layer) {
      if(layer.type == "IMAGE"){
        legends[layer.getZIndex()] = layer.values_.source.url_+'&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER='+layer.values_.source.params_.LAYERS+'&STYLE='+layer.values_.source.params_.STYLES+'&FORMAT=image/png';
      }
    });

    for (var i = legends.length - 1; i >= 0; i--) {
      if(legends[i] !== undefined){
        legendsDiv += '<div><img src="' + legends[i] + '"></div>';
      }
    }
    document.getElementById('legend').innerHTML = legendsDiv;
  }

  // Open/Close dock behaviour
  $('#dock-close').on("click", function(e){
    $('#mapmenu .nav-link').removeClass('active');
    $("#dock").hide();
  });

  $('#mapmenu .nav-link').on('shown.bs.tab', function (e) {
    $("#dock").show();
  });

  $('#pdf-print-btn').on("click", function(e){

    $(this).addClass("disabled");
    document.body.style.cursor = 'progress';

    var dims = {
       a0: [1189, 841],
       a1: [841, 594],
       a2: [594, 420],
       a3: [420, 297],
       a4: [297, 210],
       a5: [210, 148]
     };

    var format = document.getElementById('format-pdf-print').value;
    var resolution = document.getElementById('resolution-pdf-print').value;
    var dim = dims[format];
    var width = Math.round(dim[0] * resolution / INCHTOMM);
    var height = Math.round(dim[1] * resolution / INCHTOMM);
    var size = mapBuilder.map.getSize();
    var extent = mapBuilder.map.getView().calculateExtent(size);

    var pdf = new jsPDF('landscape', 'mm', format);
    // Add title
    pdf.setFontSize(18);
    pdf.text($('#pdf-print-title').val(), 50, 10);

    var offset = 25;
    var maxWidthLegend = 0;

    $( "#legend img" ).each(function( index, legend ) {
      pdf.addImage(legend, 'PNG', 0, offset * INCHTOMM/resolution);
      offset += legend.height;

      if( legend.width > maxWidthLegend){
        maxWidthLegend = legend.width;
      }
    });

    // Add map and save pdf
    mapBuilder.map.once('rendercomplete', function(event) {
      var canvas = event.context.canvas;
      var data = canvas.toDataURL('image/jpeg');
 
      pdf.addImage(data, 'JPEG', maxWidthLegend * INCHTOMM/resolution, 20, dim[0] - (maxWidthLegend * INCHTOMM/resolution), dim[1]);
      pdf.save('map.pdf');
      // Reset original map size
      mapBuilder.map.setSize(size);
      mapBuilder.map.getView().fit(extent, {size: size});
      document.body.style.cursor = 'auto';
    });

    // Set print size
    var printSize = [width - maxWidthLegend, height];
    mapBuilder.map.setSize(printSize);
    mapBuilder.map.getView().fit(extent, {size: printSize});

    $(this).removeClass("disabled");
  });

  // Save user's map context
  $('#savemap-btn').on("click", function(e){

    var mapContext = [];

    mapBuilder.map.getLayers().forEach(function(layer) {
      // Don't add OSM
      if(layer.values_.title != "OSM"){

        var layerProperties = layer.getProperties();
        var layerSourceParams = layer.getSource().getParams();

        mapContext.push({
          title: layerProperties.title,
          repositoryId: layerProperties.repositoryId,
          projectId: layerProperties.projectId,
          opacity: layerProperties.opacity,
          bbox: layerProperties.bbox,
          popup: layerProperties.popup,
          zIndex: layerProperties.zIndex,
          minResolution: layerProperties.minResolution,
          maxResolution: layerProperties.maxResolution, //maxResolution peut valoir Infinity et devient null en json
          name: layerSourceParams.LAYERS,
          style: layerSourceParams.STYLES
        });
      }
    });

    $.ajax({
      url: "/index.php/mapBuilder/mapcontext/save/",
      type:"POST",
      data: JSON.stringify(mapContext),
      contentType:"application/json",
      dataType:"text",
      success: function( data ){
        if(data == "ok"){
          $('#message').html('\
            <div class="alert alert-success alert-dismissible fade show" role="alert">\
              Contexte de la carte enregistré.\
              <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
              <span aria-hidden="true">&times;</span>\
              </button>\
            </div>');
          $('#message .alert').alert();
        }
      }
    });
  });

  // Add layers based on map context if present
  if(mapBuilder.hasOwnProperty('mapcontext') && mapBuilder.mapcontext.length > 0){
    for (var i = 0; i < mapBuilder.mapcontext.length; i++) {
      var layerContext = mapBuilder.mapcontext[i];

      var newLayer = new ImageLayer({
        title: layerContext.title,
        repositoryId: layerContext.repositoryId,
        projectId: layerContext.projectId,
        opacity: layerContext.opacity,
        bbox: layerContext.bbox,
        popup: layerContext.popup,
        zIndex: layerContext.zIndex,
        minResolution: layerContext.minResolution,
        maxResolution: layerContext.maxResolution != null ? layerContext.maxResolution : Infinity,
        source: new ImageWMS({
          url: '/index.php/lizmap/service/?repository=' + layerContext.repositoryId + '&project=' + layerContext.projectId,
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

  // Disable tooltip on focus
  $('[data-toggle="tooltip"]').tooltip({
     'trigger': 'hover'
  });
});