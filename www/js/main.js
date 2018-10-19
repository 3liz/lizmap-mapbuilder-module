$(function() {

    function buildLayerTree(layer) {
        var myArray = [];
        if (Array.isArray(layer)) {
            layer.forEach(function(sublayer) {
                myArray = myArray.concat(buildLayerTree(sublayer));
            });
            return myArray;
        }
        var myObj = { title: layer.Title, checkbox: true };
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
            layerTree.push({ title: layer.getProperties().title, checkbox: true, ol_uid: layer.ol_uid });
        });

        // Reverse to show top layers at top of the tree
        layerTree.reverse();

        if ($.ui.fancytree.getTree("#layerSelected") !== null) {
            $.ui.fancytree.getTree("#layerSelected").reload(layerTree);
        }
    }

    var map = new ol.Map({
        target: 'map',
        // layers: [
        //   new ol.layer.Tile({
        //     title: "OSM",
        //     source: new ol.source.OSM()
        //   })
        // ],
        view: new ol.View({
            center: [430645.4279553129, 5404295.196391977],
            zoom: 13
        })
    });

    $('#layerSelection').fancytree({
        selectMode: 3,
        source: mapBuilder.layerSelectionTree,
        select: function(event, data) {
            var node = data.node;
            var parentList = node.getParentList();
            // We get repositoryId and projectId from parents node in the tree
            var repositoryId = parentList[1].data.repository;
            var projectId = parentList[1].data.project;

            if (node.selected) {
                var layer = new ol.layer.Image({
                    title: node.title,
                    repositoryId: repositoryId,
                    projectId: projectId,
                    source: new ol.source.ImageWMS({
                        url: '/index.php/lizmap/service/?repository=' + repositoryId + '&project=' + projectId,
                        params: { 'LAYERS': node.title }
                    })
                });
                map.addLayer(layer);
                refreshLayerSelected();
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
        }
    });

    $('#layerSelected').fancytree({
        extensions: ["dnd5"],
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
        }
    });
});