<?php
class mapBuilderViewListener extends jEventListener{

    function onmainviewGetMaps ($event) {

        // Access control
        if( jAcl2::check("mapBuilder.access") ){
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

                $extentArraySource = explode(",", $readConfigPath['extent']);

                // Is extent valid ?
                if(count($extentArraySource) == 4 && $extentArraySource === array_filter($extentArraySource, 'is_numeric')){
                    // Cast as float
                    $extentArraySource = array_map('floatval', $extentArraySource);

                    // Handle WGS84 bounds
                    $sourceMinPt = new proj4phpPoint( max($extentArraySource[0], -180.0), max($extentArraySource[1], -85.06) );
                    $sourceMaxPt = new proj4phpPoint( min($extentArraySource[2], 180.0), min($extentArraySource[3], 85.06) );

                    try {
                        $destMinPt = $proj4->transform($sourceProj,$destProj,$sourceMinPt);
                        $destMaxPt = $proj4->transform($sourceProj,$destProj,$sourceMaxPt);

                        $extent = implode(", ", array( $destMinPt->x, $destMinPt->y, $destMaxPt->x, $destMaxPt->y ));

                    } catch (Exception $e) {
                        // Max extent in EPSG:3857
                        $extent = "-20026376.39,-20048966.10,20026376.39,20048966.10";
                    }
                }else{
                    jMessage::add(jLocale::get("mapBuilder~default.extent.value.error"), 'error');
                    $extent = jLocale::get("mapBuilder~default.extent.value.error");
                }
            }
            
            $illustration = jApp::urlBasePath().'themes/'.jApp::config()->theme.'/css/img/250x250_mappemonde.png';

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
}
