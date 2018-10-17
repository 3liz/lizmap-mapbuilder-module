<h2>Catalogue de couches</h2>
<aside id="layerSelection">
  <ul>
  {foreach $nestedTree as $key => $repository}
    <li id="repository_{$key}" data-repository="{$key}">
      {$repository['label']}
      <ul>
      {foreach $repository['projects'] as $projectKey => $projectTitle}
        <li class="lazy" id="project_{$projectKey}" data-repository="{$key}" data-project="{$projectKey}">{$projectTitle}</li>
      {/foreach}
      </ul>
      {$repository->label}
    </li>
  {/foreach}
  </ul>
</aside>

<h2>Couches sélectionnées</h2>
<aside id="layerSelected">
  <ul></ul>
</aside>


<div id="map" class="map"></div>
<script type="text/javascript">
  {literal}
      var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            title: "OSM",
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: [430645.4279553129, 5404295.196391977],
          zoom: 13
        })
      });

      function buildLayerTree(layer){
        var myArray = [];
        if(Array.isArray(layer)){
          layer.forEach(function(sublayer) {
            myArray = myArray.concat(buildLayerTree(sublayer));
          });
          return myArray;
        }
        var myObj = {title: layer.Title, checkbox: true};
        myArray.push(myObj);
        if(layer.hasOwnProperty('Layer')){
          myObj.folder = true;
          myObj.children = buildLayerTree(layer.Layer);
        }
        return myArray;
      }

      function refreshLayerSelected(){
        var layerTree = [];
        map.getLayers().forEach(function(layer) {
            layerTree.push({title: layer.getProperties().title, checkbox: true});
          });

        if($.ui.fancytree.getTree("#layerSelected") === null){
          $('#layerSelected').fancytree({
              source: layerTree
            });
        }else{
          $.ui.fancytree.getTree("#layerSelected").reload(layerTree);
        }
      }

    $(function(){

      $('#layerSelection').fancytree({
        selectMode: 3,
          select: function(event, data) {
            var node = data.node;
            var parentList = node.getParentList();
            // We get repositoryId and projectId from parents node in the tree
            var repositoryId = parentList[1].data.repository;
            var projectId = parentList[1].data.project;

            if(node.selected){
              var layer = new ol.layer.Image({
                        title: node.title,
                        repository: repositoryId,
                        projectId: projectId,
                        source: new ol.source.ImageWMS({
                          url: '/index.php/lizmap/service/?repository='+repositoryId+'&project='+projectId,
                          params: {'LAYERS': node.title}
                        })
                      });
              map.addLayer(layer);
              refreshLayerSelected();
            }
          },
         lazyLoad: function(event, data){
          //https://github.com/mar10/fancytree/wiki/TutorialLoadData
          var repositoryId = data.node.data.repository;
          var projectId = data.node.data.project;
          var url = "/index.php/lizmap/service/?repository="+repositoryId+"&project="+projectId+"&SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0";
          var parser = new ol.format.WMSCapabilities();

          var dfd = new $.Deferred();
          data.result = dfd.promise();

          $.get( url, function( capabilities ) {
            var result = parser.read(capabilities);

            var node = result.Capability;

            // First layer is in fact project
            if(node.hasOwnProperty('Layer')){
              dfd.resolve(buildLayerTree(node.Layer.Layer));
            }
          });
        }
      });
    });

  {/literal}
</script>