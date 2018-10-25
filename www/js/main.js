var map = null;

$(function() {

    function buildLayerTree(layer) {
        var myArray = [];
        if (Array.isArray(layer)) {
            layer.forEach(function(sublayer) {
                myArray = myArray.concat(buildLayerTree(sublayer));
            });
            return myArray;
        }

        var myObj = { title: layer.Title};
        if(layer.hasOwnProperty('Style')){
          myObj.style = layer.Style;
        }

        myArray.push(myObj);
        if (layer.hasOwnProperty('Layer')) {
            myObj.folder = true;
            myObj.children = buildLayerTree(layer.Layer);
        }
        return myArray;
    }

    function refreshLayerSelected() {
        var layerTree = [];
        map.getLayers().forEach(function(layer) {
            layerTree.push({
              title: layer.getProperties().title,
              styles: layer.getSource().getParams().STYLES,
              ol_uid: layer.ol_uid
            });
        });

        // Reverse to show top layers at top of the tree
        layerTree.reverse();

        if ($.ui.fancytree.getTree("#layerSelected") !== null) {
            $.ui.fancytree.getTree("#layerSelected").reload(layerTree);
        }
    }

    map = new ol.Map({
        target: 'map',
        // layers: [
        //   new ol.layer.Tile({
        //     title: "OSM",
        //     source: new ol.source.OSM()
        //   })
        // ],
        view: new ol.View({
            center: [430645.4279553129, 5404295.196391977],
            zoom: 12
        })
    });

    $('#layerSelection').fancytree({
        selectMode: 3,
        source: mapBuilder.layerSelectionTree,
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
            var url = "/index.php/lizmap/service/?repository=" + repositoryId + "&project=" + projectId + "&SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0";
            var parser = new ol.format.WMSCapabilities();

            var dfd = new $.Deferred();
            data.result = dfd.promise();

            $.get(url, function(capabilities) {
                var result = parser.read(capabilities);

                var node = result.Capability;

                // First layer is in fact project
                if (node.hasOwnProperty('Layer')) {
                    dfd.resolve(buildLayerTree(node.Layer.Layer));
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
            $tdList.eq(1).html("<select class='layerStyles'>"+styleOption+"</select>");
          }
          // Add button for layers (level 1 => repositories, 2 => projects)
          if(node.getLevel() > 2){
            $tdList.eq(2).html("<button class='addLayerButton'>+</button>");
          }
        }
    });

    /* Handle custom addLayerButton clicks (http://wwwendt.de/tech/fancytree/demo/#sample-ext-table.html) */
    $('#layerSelection').on("click", ".addLayerButton", function(e){
      var node = $.ui.fancytree.getNode(e);

      var parentList = node.getParentList();
      // We get repositoryId and projectId from parents node in the tree
      var repositoryId = parentList[1].data.repository;
      var projectId = parentList[1].data.project;

      var layer = new ol.layer.Image({
          title: node.title,
          repositoryId: repositoryId,
          projectId: projectId,
          source: new ol.source.ImageWMS({
              url: '/index.php/lizmap/service/?repository=' + repositoryId + '&project=' + projectId,
              params: {
                'LAYERS': node.title,
                'STYLES': $(node.tr).find(">td .layerStyles :selected").text()
              }
          })
      });

      map.addLayer(layer);
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
                    var layers = map.getLayers().getArray();
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
        }
    });
});