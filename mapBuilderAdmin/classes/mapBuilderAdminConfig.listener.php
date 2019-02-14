<?php
class mapBuilderAdminConfigListener extends jEventListener{

  function onmasteradminGetMenuContent ($event) {

    if( jAcl2::check("lizmap.admin.access") && jAcl2::check("mapBuilder.access")){
      // Create the "mapBuilderAdmin" parent menu item
      $bloc = new masterAdminMenuItem('mapBuilderAdmin', jLocale::get("mapBuilder~default.app.name"), '', 121);

      // Child for the configuration of mapBuilder
      $bloc->childItems[] = new masterAdminMenuItem(
        'mapBuilderAdmin_configuration',
        jLocale::get("mapBuilderAdmin~admin.menu.configuration.label"),
        jUrl::get('mapBuilderAdmin~config:index'), 122
      );

      // Add the bloc
      $event->add($bloc);
    }
  }
}
