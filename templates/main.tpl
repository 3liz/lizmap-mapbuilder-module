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