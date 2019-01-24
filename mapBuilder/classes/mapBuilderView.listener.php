<?php
class mapBuilderViewListener extends jEventListener{

    function onmainviewGetMaps ($event) {

        $name = jLocale::get('mapBuilder~default.app.name');
        $access = jLocale::get('mapBuilder~default.app.access');
        $description = jLocale::get('mapBuilder~default.app.description');

        // Default extent is metropolitan France in EPSG:3857.
        $extent = '-517635.63,6742470.88,1013007.37,4957918.98';
        // Read mapBuilder configuration
        $readConfigPath = parse_ini_file(jApp::configPath('mapBuilder.ini.php'), True);
        // Get original extent from ini file if set
        if(array_key_exists('extent', $readConfigPath)){
            // Reproject extent in ini file from EPSG:4326 to EPSG:3857.
            $proj4 = new Proj4php();
            $sourceProj = new Proj4phpProj('EPSG:4326', $proj4);
            $destProj  = new Proj4phpProj('EPSG:3857', $proj4);

            $extentArraySource = explode(",", str_replace(array("[", "]"), "", $readConfigPath['extent']));

            $sourceMinPt = new proj4phpPoint( $extentArraySource[0], $extentArraySource[1] );
            $destMinPt   = $proj4->transform($sourceProj,$destProj,$sourceMinPt);

            $sourceMaxPt = new proj4phpPoint( $extentArraySource[2], $extentArraySource[3] );
            $destMaxPt   = $proj4->transform($sourceProj,$destProj,$sourceMaxPt);

            $extent = implode(", ", array( $destMinPt->x, $destMinPt->y, $destMaxPt->x, $destMaxPt->y ));
        }
        
        $illustration = jApp::wwwPath().'themes/'.jApp::config()->theme.'/css/img/250x250_mappemonde.png';

        jClasses::inc('lizmapMainViewItem');
        $mrep = new lizmapMainViewItem('_map_builder_rep', $name);
        $mrep->childItems[] = new lizmapMainViewItem(
            'map_builder',
            $access,
            $description,
            'EPSG:3857',
            $extent,
            jUrl::get('mapBuilder~default:index'),
            $illustration,
            2,
            '_map_builder_rep',
            'map'
        );
        $event->add( $mrep );
    }
}
