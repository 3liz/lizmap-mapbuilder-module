{meta_html css $j_basepath.'mapBuilder/css/ol.css'}
{meta_html js $j_basepath.'mapBuilder/js/mapbuilderadmin.js'}

{jmessage_bootstrap}

<h1>{@mapBuilderAdmin~admin.menu.configuration.label@}</h1>

{ifacl2 'lizmap.admin.services.update'}
<div id="map" style="max-height: 350px"></div>

{formfull $form, 'mapBuilderAdmin~config:save', array(), 'htmlbootstrap'}

{/ifacl2}

<div>
  <a class="btn" href="{jurl 'mapBuilderAdmin~config:index'}">{@admin~admin.configuration.button.back.label@}</a>
</div>