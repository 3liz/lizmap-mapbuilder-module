<aside id="layerSelection">
  <ul>
  {foreach $nestedTree as $key => $repository}
    <li id="repository_{$key}">
      {$repository['label']}
      <ul>
      {foreach $repository['projects'] as $projectKey => $projectTitle}
        <li id="project_{$projectkey}">{$projectTitle}</li>
      {/foreach}
      </ul>
      {$repository->label}
    </li>
  {/foreach}
  </ul>
</aside>


<!-- <div id="map" class="map"></div> -->
<script type="text/javascript">
  {literal}
      var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([37.41, 8.82]),
          zoom: 4
        })
      });

    $(function(){
      $('#layerSelection').fancytree();
    });
  {/literal}
</script>