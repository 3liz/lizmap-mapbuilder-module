<?php

/**
 * @author    3liz
 * @copyright 2018-2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */
class defaultCtrl extends jController
{
    protected $jsonOnJs = array(
        'mapBuilder' => array(),
        'lizUrls' => array(),
        'lizDict' => array(),
    );

    public function index()
    {
        // Access control
        if (!jAcl2::check('mapBuilder.access')) {
            $rep = $this->getResponse('redirect');
            $rep->action = 'view~default:index';
            jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');

            return $rep;
        }

        $rep = $this->getResponse('html', true); // true désactive le template général

        $configFile = jApp::varconfigPath('mapBuilder.ini.php');
        if (!file_exists($configFile)) {
            $rep = $this->getResponse('basichtml', true);
            $rep->addContent('<p>MapBuilder is not configured correctly. Its configuration file is missing.</p>');

            return $rep;
        }

        // Get lizmap services
        $services = lizmap::getServices();

        $title = jLocale::get('mapBuilder~default.app.name');
        $rep->title = $title;

        $rep->favicon = jApp::urlBasePath().'assets/favicon/favicon.ico';

        $rep->metaViewport = 'initial-scale=1.0, user-scalable=no, width=device-width, shrink-to-fit=no';
        // Assets
        $rep->addCSSLink(jApp::urlBasePath().'assets/css/main.css');
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
            'basepath' => jApp::urlBasePath(),
            'config' => jUrl::get('lizmap~service:getProjectConfig'),
            'wms' => jUrl::get('lizmap~service:index'),
            'media' => jUrl::get('view~media:getMedia'),
            'mapcontext_add' => jUrl::get('mapBuilder~mapcontext:add'),
            'mapcontext_delete' => jUrl::get('mapBuilder~mapcontext:delete'),
            'mapcontext_get' => jUrl::get('mapBuilder~mapcontext:get'),
        );

        // Load lizUrls before mapbuilder. Webpack public path needs it
        $this->fillJson('lizUrls', 'lizUrls', $lizUrls);

        $rep->addJSLink(jApp::urlBasePath().'mapBuilder/js/mapbuilder.js');

        // Read mapBuilder configuration
        $readConfigPath = parse_ini_file($configFile, true);

        // Build repository + project tree for FancyTree
        $nestedTree = array();

        $repositoryList = array();

        // Get selected repository from ini file if set
        if (array_key_exists('repository', $readConfigPath) && !is_null(lizmap::getRepository($readConfigPath['repository']))) {
            $repositoryList[] = $readConfigPath['repository'];
        } else {
            $repositoryList = lizmap::getRepositoryList();
        }

        foreach ($repositoryList as $repositoryName) {
            $repository = lizmap::getRepository($repositoryName);
            if (jAcl2::check('lizmap.repositories.view', $repository->getKey())) {
                $projects = $repository->getProjects();

                $projectArray = array();
                foreach ($projects as $project) {
                    $projectArray[] = array(
                        'title' => $project->getData('title'), // deprecated, use getTitle() for lizmap >=3.5
                        'folder' => true,
                        'lazy' => true,
                        'repository' => $repositoryName,
                        'project' => $project->getKey(),
                    );
                }

                $nestedTree[] = array(
                    'title' => $repository->getData('label'), // deprecated, use getLabel() for lizmap >=3.5
                    'folder' => true,
                    'children' => $projectArray,
                );
            }
        }

        // Write tree as JSON
        $this->fillJson('mapBuilder', 'layerStoreTree', $nestedTree);

        // Get original extent from ini file if set
        if (array_key_exists('extent', $readConfigPath)) {
            $extent = array_map('floatval', explode(',', $readConfigPath['extent']));

            $this->fillJson('mapBuilder', 'extent', $extent);
        }
        // Get base layer from ini file if set
        if (array_key_exists('baseLayer', $readConfigPath)) {
            $this->fillJson('mapBuilder', 'baseLayer', $readConfigPath['baseLayer']);

            jClasses::inc('mapBuilder~listBaseLayer');
            $listBaseLayer = (new listBaseLayer(0))->getData(0);

            $userListBaseLayer = explode(',', $readConfigPath['baseLayer']);

            foreach ($listBaseLayer as $key => $value) {
                if (!in_array($key, $userListBaseLayer)) {
                    unset($listBaseLayer[$key]);
                }
            }

            $rep->body->assign('baseLayer', $listBaseLayer);
        }
        // Get default base layer from ini file if set
        if (array_key_exists('baseLayerDefault', $readConfigPath)) {
            $rep->body->assign('baseLayerDefault', $readConfigPath['baseLayerDefault']);
        }
        // Get base layer key from ini file if set
        if (array_key_exists('baseLayerKeyOSMCycleMap', $readConfigPath)) {
            $this->fillJson('mapBuilder', 'baseLayerKeyOSMCycleMap', $readConfigPath['baseLayerKeyOSMCycleMap']);
        }
        // Get base layer key from ini file if set
        if (array_key_exists('baseLayerKeyBing', $readConfigPath)) {
            $this->fillJson('mapBuilder', 'baseLayerKeyBing', $readConfigPath['baseLayerKeyBing']);
        }
        // Get base layer key from ini file if set
        if (array_key_exists('baseLayerKeyIGN', $readConfigPath)) {
            $this->fillJson('mapBuilder', 'baseLayerKeyIGN', $readConfigPath['baseLayerKeyIGN']);
        }
        // Get attributeTableTool key from ini file if set
        if (array_key_exists('attributeTableTool', $readConfigPath)) {
            $rep->body->assign('attributeTableTool', $readConfigPath['attributeTableTool']);
        }

        // Get locales
        $lang = $this->param('lang');

        if (!$lang) {
            $lang = jLocale::getCurrentLang().'_'.jLocale::getCurrentCountry();
        }

        $data = array();
        $path = jApp::getModulePath('mapBuilder').'locales/en_US/dictionary.UTF-8.properties';
        if (file_exists($path)) {
            $lines = file($path);
            foreach ($lines as $lineNumber => $lineContent) {
                if (!empty($lineContent) and $lineContent != '\n') {
                    $exp = explode('=', trim($lineContent));
                    if (!empty($exp[0])) {
                        $data[$exp[0]] = jLocale::get('mapBuilder~dictionary.'.$exp[0], null, $lang);
                    }
                }
            }
        }
        $this->fillJson('lizDict', 'lizDict', $data);

        $rep->body->assign('repositoryLabel', $title);
        $rep->body->assign('isConnected', jAuth::isConnected());
        $rep->body->assign('user', jAuth::getUserSession());
        $rep->body->assign('allowUserAccountRequests', $services->allowUserAccountRequests);

        // Add Google Analytics ID
        if ($services->googleAnalyticsID != '' && preg_match('/^UA-\d+-\d+$/', $services->googleAnalyticsID) == 1) {
            $rep->body->assign('googleAnalyticsID', $services->googleAnalyticsID);
        }

        $rep->bodyTpl = 'mapBuilder~main';

        // Affichage de la liste des mapcontext
        $rep->body->assignZone('LIST_MAPCONTEXT', 'list_mapcontext');

        // Override default theme with color set in admin panel
        if ($cssContent = jFile::read(jApp::varPath('lizmap-theme-config/').'theme.css')) {
            $css = '<style type="text/css">'.$cssContent.'</style>';
            $rep->addHeadContent($css);
        }

        $this->putJsonOnJs($rep);

        return $rep;
    }

    protected function putJsonOnJs($rep)
    {
        foreach ($this->jsonOnJs as $key => $value) {
            $encodedJson = json_encode($value);
            $rep->addHeadContent('<script id="conf-script-'.$key.'" type="application/json">'.$encodedJson.'</script>');
        }
    }

    protected function fillJson($id, $key, $value)
    {
        $this->jsonOnJs[$id][$key] = $value;
    }
}
