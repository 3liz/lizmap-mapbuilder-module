<?php
/**
* @package   lizmap
* @subpackage mapBuilder
* @author    3liz
* @copyright 2018-2020 3liz
* @link      http://3liz.com
* @license   Mozilla Public License : http://www.mozilla.org/MPL/
*/

class defaultCtrl extends jController {
    /**
    *
    */
    function index() {
        // Access control
        if( !jAcl2::check('mapBuilder.access')){
          $rep = $this->getResponse('redirect');
          $rep->action = 'view~default:index';
          jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
          return $rep;
        }

        $rep = $this->getResponse('html', true);// true désactive le template général

        // Get lizmap services
        $services = lizmap::getServices();

        $title = jLocale::get('mapBuilder~default.app.name');;
        $rep->title = $title;

        $rep->metaViewport = 'initial-scale=1.0, user-scalable=no, width=device-width, shrink-to-fit=no';
        // Assets
        $rep->addCSSLink(jApp::urlBasePath().'css/main.css');
        $rep->addCSSLink(jApp::urlBasePath().'mapBuilder/css/ol.css');
        $rep->addCSSLink(jApp::urlBasePath().'mapBuilder/css/fontawesome-free-web/css/all.min.css');
        $rep->addCSSLink(jApp::urlBasePath().'mapBuilder/css/bootstrap.min.css');
        $rep->addCSSLink(jApp::urlBasePath().'mapBuilder/css/main.css');

        $rep->addStyle('html, body, .map', 'height: 100%;width: 100%;margin: 0;padding: 0');

        $rep->addJSLink(jApp::urlBasePath().'mapBuilder/js/es6-promise.auto.min.js');
        $rep->addJSLink(jApp::urlBasePath().'mapBuilder/js/jquery.min.js');
        $rep->addJSLink(jApp::urlBasePath().'mapBuilder/js/jquery.fancytree-all-deps.min.js');
        $rep->addJSLink(jApp::urlBasePath().'mapBuilder/js/popper.min.js');
        $rep->addJSLink(jApp::urlBasePath().'mapBuilder/js/bootstrap.min.js');

        // Pass some configuration options to the web page through javascript var
        $lizUrls = array(
          "basepath" => jApp::urlBasePath(),
          "config" => jUrl::get('lizmap~service:getProjectConfig'),
          "wms" => jUrl::get('lizmap~service:index'),
          "media" => jUrl::get('view~media:getMedia'),
          "mapcontext_add" => jUrl::get('mapBuilder~mapcontext:add'),
          "mapcontext_delete" => jUrl::get('mapBuilder~mapcontext:delete'),
          "mapcontext_get" => jUrl::get('mapBuilder~mapcontext:get')
        );

        // Load lizUrls before mapbuilder. Webpack public path needs it
        $rep->addJSCode("var lizUrls = ".json_encode($lizUrls).";", true);

        $rep->addJSLink(jApp::urlBasePath().'mapBuilder/js/mapbuilder.js');

        // Read mapBuilder configuration
        $readConfigPath = parse_ini_file(jApp::configPath('mapBuilder.ini.php'), True);

        // Build repository + project tree for FancyTree
        $nestedTree = array();

        $repositoryList = array();

        // Get selected repository from ini file if set
        if(array_key_exists('repository', $readConfigPath) && !is_null(lizmap::getRepository($readConfigPath['repository']))){
            $repositoryList[] = $readConfigPath['repository'];
        }else{
            $repositoryList = lizmap::getRepositoryList();
        }

        foreach ($repositoryList as $repositoryName) {
            $repository = lizmap::getRepository($repositoryName);
            if( jAcl2::check('lizmap.repositories.view', $repository->getKey() )){
                $projects = $repository->getProjects();

                $projectArray = array();
                foreach ($projects as $project) {
                    $projectArray[] = [
                        "title" => $project->getData('title'),
                        "folder" => true,
                        "lazy" => true,
                        "repository" => $repositoryName,
                        "project" => $project->getKey()
                    ];
                }

                $nestedTree[] = [
                    "title" => $repository->getData('label'),
                    "folder" => true,
                    "children" => $projectArray
                ];
            }
        }

        // Write tree as JSON
        $rep->addJSCode('var mapBuilder = {"layerStoreTree": '.json_encode($nestedTree).'};');

        // Get original extent from ini file if set
        if(array_key_exists('extent', $readConfigPath)){
            $rep->addJSCode("mapBuilder.extent = [".$readConfigPath['extent']."];");
        }
        // Get base layer from ini file if set
        if(array_key_exists('baseLayer', $readConfigPath)){
            $rep->addJSCode("mapBuilder.baseLayer = '".$readConfigPath['baseLayer']."';");

            jClasses::inc('mapBuilder~listBaseLayer');
            $listBaseLayer = (new listBaseLayer(0))->getData(0);

            $userListBaseLayer = explode(',', $readConfigPath['baseLayer']);

            foreach ($listBaseLayer as $key => $value) {
                if(!in_array($key, $userListBaseLayer)){
                    unset($listBaseLayer[$key]);
                }
            }

            $rep->body->assign('baseLayer', $listBaseLayer);
        }
        // Get default base layer from ini file if set
        if(array_key_exists('baseLayerDefault', $readConfigPath)){
            $rep->body->assign('baseLayerDefault', $readConfigPath['baseLayerDefault']);
        }
        // Get base layer key from ini file if set
        if(array_key_exists('baseLayerKeyOSMCycleMap', $readConfigPath)){
            $rep->addJSCode("mapBuilder.baseLayerKeyOSMCycleMap = '".$readConfigPath['baseLayerKeyOSMCycleMap']."';");
        }
        // Get base layer key from ini file if set
        if(array_key_exists('baseLayerKeyBing', $readConfigPath)){
            $rep->addJSCode("mapBuilder.baseLayerKeyBing = '".$readConfigPath['baseLayerKeyBing']."';");
        }
        // Get base layer key from ini file if set
        if(array_key_exists('baseLayerKeyIGN', $readConfigPath)){
            $rep->addJSCode("mapBuilder.baseLayerKeyIGN = '".$readConfigPath['baseLayerKeyIGN']."';");
        }
        // Get attributeTableTool key from ini file if set
        if(array_key_exists('attributeTableTool', $readConfigPath)){
            $rep->body->assign('attributeTableTool', $readConfigPath['attributeTableTool']);
        }

        // Get locales
        $lang = $this->param('lang');

        if(!$lang)
          $lang = jLocale::getCurrentLang().'_'.jLocale::getCurrentCountry();

        $data = array();
        $path = jApp::getModulePath('mapBuilder').'locales/en_US/dictionary.UTF-8.properties';
        if(file_exists($path)){
          $lines = file($path);
          foreach ($lines as $lineNumber => $lineContent){
            if(!empty($lineContent) and $lineContent != '\n'){
              $exp = explode('=', trim($lineContent));
              if(!empty($exp[0]))
                $data[$exp[0]] = jLocale::get('mapBuilder~dictionary.'.$exp[0], null, $lang);
            }
          }
        }
        $rep->addJSCode('var lizDict = '.json_encode($data).';');

        $rep->body->assign('repositoryLabel', $title);
        $rep->body->assign('isConnected', jAuth::isConnected());
        $rep->body->assign('user', jAuth::getUserSession());
        $rep->body->assign('allowUserAccountRequests', $services->allowUserAccountRequests);

        // Add Google Analytics ID
        if($services->googleAnalyticsID != '' && preg_match("/^UA-\d+-\d+$/", $services->googleAnalyticsID) == 1 ) {
            $rep->body->assign('googleAnalyticsID', $services->googleAnalyticsID);
        }

        $rep->bodyTpl = 'mapBuilder~main';

        // Affichage de la liste des mapcontext
        $rep->body->assignZone('LIST_MAPCONTEXT', 'list_mapcontext');

        // Override default theme with color set in admin panel
        if($cssContent = jFile::read(jApp::varPath('lizmap-theme-config/') . 'theme.css') ){
          $css = '<style type="text/css">' . $cssContent . '</style>';
          $rep->addHeadContent($css);
        }

        return $rep;
    }
}
