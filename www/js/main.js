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

// TODO : récupérer ses valeurs depuis un fichier de conf 
var originalCenter = [430645.4279553129, 5404295.196391977];
var originalZoom = 12;

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

      var myObj = { title: cfg.layers[layer.Name].title, name : layer.Name};
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
          if(layer.values_.title != "OSM"){
            layerTree[layer.getZIndex()] = {
                title: layer.getProperties().title,
                styles: layer.getSource().getParams().STYLES,
                ol_uid: layer.ol_uid
              };
          }
        });

        // Reverse to show top layers at top of the tree
        layerTree.reverse();
        // Remove empty values (TODO: à améliorer)
        layerTree = layerTree.filter(n => n);

        if ($.ui.fancytree.getTree("#layerSelected") !== null) {
            $.ui.fancytree.getTree("#layerSelected").reload(layerTree);
        }
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
        $(this.element).addClass('active');

        this.getMap().getInteractions().forEach(function(interaction) {
          if(interaction.constructor.name === "DragZoom"){
            interaction.condition_ = alwaysCondition;
          }
        });
      };

      return dragZoomControl;
    }(Control));

    var exportPDFControl = (function (Control) {
      function exportPDFControl(opt_options) {
        var options = opt_options || {};

        var button = document.createElement('button');
        button.className = 'fas fa-file-pdf';
        button.title = 'Impression PDF';

        var element = document.createElement('div');
        element.className = 'ol-export-pdf ol-unselectable ol-control';
        element.appendChild(button);

        Control.call(this, {
          element: element,
          target: options.target
        });

        button.addEventListener('click', this.handleExportPDF.bind(this), false);
      }

      if ( Control ) exportPDFControl.__proto__ = Control;
      exportPDFControl.prototype = Object.create( Control && Control.prototype );
      exportPDFControl.prototype.constructor = exportPDFControl;

      exportPDFControl.prototype.handleExportPDF = function handleExportPDF () {
        document.body.style.cursor = 'progress';
        var canvas = $('#map canvas');
        var data = canvas[0].toDataURL('image/jpeg');
        var pdf = new jsPDF('landscape');
        pdf.addImage(data, 'JPEG', 0, 0);
        pdf.save('map.pdf');
        document.body.style.cursor = 'auto';
      };

      return exportPDFControl;
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
          new exportPDFControl(),
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

          // Disable buttons if current scale not between minScale et maxScale
          var disabled = '';

          // Min/max Scale
          // if(node.data.hasOwnProperty('minScale')){
          //   disabled = 'disabled';
          // }

          // Style list
          if(node.data.hasOwnProperty('style')){
            var styleOption = "";
            node.data.style.forEach(function(style) {
              styleOption += "<option>"+style.Name+"</option>";
            });
            $tdList.eq(1).html("<select "+disabled+" class='layerStyles'>"+styleOption+"</select>");
          }
          // Add button for layers (level 1 => repositories, 2 => projects)
          if(node.getLevel() > 2 && node.children == null){
            $tdList.eq(2).html("<button "+disabled+" type='button' class='addLayerButton btn btn-sm'><i class='fas fa-plus'></i></button>");
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
          source: new ImageWMS({
              url: '/index.php/lizmap/service/?repository=' + repositoryId + '&project=' + projectId,
              params: {
                'LAYERS': node.data.name,
                'STYLES': $(node.tr).find(">td .layerStyles :selected").text()
              }
          })
      });

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

          var getLegendURL = "";

          var layers = mapBuilder.map.getLayers().getArray();
          for (var i = 0; i < layers.length; i++) {
            if(layers[i].ol_uid == node.data.ol_uid){
              // console.log(layers[i]);
              getLegendURL = layers[i].values_.source.url_+'&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER='+layers[i].values_.source.params_.LAYERS+'&STYLE='+layers[i].values_.source.params_.STYLES+'&FORMAT=image/png';
            }
          }

          $(node.tr).find(".toggleLegend").html("<i class='fas fa-caret-right'></i><img src='"+getLegendURL+"'>");

          $(node.tr).find(".deleteLayerButton").html("<button class='btn btn-sm'><i class='fas fa-minus'></i></button>");
          $(node.tr).find(".zoomToExtentButton").html("<button class='btn btn-sm'><i class='fas fa-search-plus'></i></button>");
          $(node.tr).find(".changeOpacityButton").html('\
            <div class="btn-group btn-group-sm" role="group" aria-label="Opacity">\
              <button type="button" class="btn" style="background-color: rgba(0, 0, 0, 0);border-color: #343a40;">20</button>\
              <button type="button" class="btn" style="background-color: rgba(0, 0, 0, 0.1);border-color: #343a40;">40</button>\
              <button type="button" class="btn" style="background-color: rgba(0, 0, 0, 0.3);border-color: #343a40;">60</button>\
              <button type="button" class="btn" style="background-color: rgba(0, 0, 0, 0.5);border-color: #343a40;color: lightgrey;">80</button>\
              <button type="button" class="btn" style="background-color: rgba(0, 0, 0, 0.7);border-color: #343a40;color: lightgrey;">100</button>\
            </div>\
            ');

          $(node.tr).find(".changeOrder").html("<div class='fas fa-caret-up changeOrder changeOrderUp'></div><div class='fas fa-caret-down changeOrder changeOrderDown'></div>");
        }
    });

    $('#layerSelected').on("click", ".toggleLegend i", function(e){
      $(this).next().toggle();
      if($(this).hasClass('fa-caret-right')){
        $(this).removeClass('fa-caret-right');
        $(this).addClass('fa-caret-down');
      }else{
        $(this).removeClass('fa-caret-down');
        $(this).addClass('fa-caret-right');
      }
      e.stopPropagation();  // prevent fancytree activate for this row
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

    $('#layerSelected').on("click", ".changeOpacityButton div button", function(e){
      var node = $.ui.fancytree.getNode(e);
      var opacity = e.target.textContent;

      var layers = mapBuilder.map.getLayers().getArray();
      for (var i = 0; i < layers.length; i++) {
        if(layers[i].ol_uid == node.data.ol_uid){
          layers[i].setOpacity(opacity/100);
        }
      }
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
});