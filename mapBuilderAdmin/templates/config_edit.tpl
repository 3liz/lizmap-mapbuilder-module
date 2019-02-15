{meta_html css $j_basepath.'mapBuilder/css/ol.css'}
{meta_html js $j_basepath.'mapBuilderAdmin/js/mapbuilderadmin.js'}

{jmessage_bootstrap}

<h1>{@mapBuilderAdmin~admin.menu.configuration.label@}</h1>

<div id="map" style="max-height: 350px"></div>

{formfull $form, 'mapBuilderAdmin~config:save', array(), 'htmlbootstrap'}

<div>
  <a class="btn" href="{jurl 'mapBuilderAdmin~config:index'}">{@admin~admin.configuration.button.back.label@}</a>
</div>

<!-- <p>Cliquez une fois pour commencer à dessiner l'emprise puis une seconde fois pour finir. Vous pouvez recommencer autant de fois que nécessaire.</p> -->

<div id="map" class="map"></div>