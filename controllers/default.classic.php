<?php
/**
* @package   lizmap
* @subpackage mapBuilder
* @author    3liz
* @copyright 2011-2018 3liz
* @link      http://3liz.com
* @license    All rights reserved
*/

class defaultCtrl extends jController {
    /**
    *
    */
    function index() {

        $rep = $this->getResponse('html', true);// true désactive le template général

        $title = "Map Builder";
        $rep->title = $title;
        // Assets
        $rep->addCSSLink(jApp::urlBasePath().'css/main.css');
        $rep->addCSSLinkModule('mapBuilder','css/ol-5.2.0.css');
        $rep->addCSSLink(jApp::urlBasePath().'mapBuilder/fontawesome-free-5.4.1-web/css/all.css');
        $rep->addCSSLinkModule('mapBuilder','css/bootstrap.min.css');
        $rep->addCSSLink(jApp::urlBasePath().'mapBuilder/skin-awesome/ui.fancytree.css');
        $rep->addCSSLinkModule('mapBuilder','css/main.css');

        $rep->addStyle('.map', 'height: 400px;width: 100%;');

        $rep->addJSLinkModule('mapBuilder','js/ol-5.2.0.min.js');
        $rep->addJSLinkModule('mapBuilder','js/jquery-3.3.1.min.js');
        $rep->addJSLinkModule('mapBuilder','js/jquery.fancytree-all-deps.min.js');
        $rep->addJSLinkModule('mapBuilder','js/bootstrap.min.js');
        $rep->addJSLinkModule('mapBuilder','js/main.js');

        $nestedTree = array();
        
        $repositories = lizmap::getRepositoryList();

        // Build repository + project tree for FancyTree 
        foreach ($repositories as $key => $repositoryName) {
        	$repository = lizmap::getRepository($repositoryName);

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

        // Write tree as JSON
        $rep->addJSCode('var mapBuilder = {}; mapBuilder.layerSelectionTree = '.json_encode($nestedTree).';');

        $rep->body->assign('repositoryLabel', $title);
        $rep->body->assign('isConnected', jAuth::isConnected());
        $rep->body->assign('user', jAuth::getUserSession());
        $rep->body->assign('allowUserAccountRequests', $services->allowUserAccountRequests);

        $rep->bodyTpl = 'mapBuilder~main';

        // Override default theme with color set in admin panel
        if($cssContent = jFile::read(jApp::varPath('lizmap-theme-config/') . 'theme.css') ){
          $css = '<style type="text/css">' . $cssContent . '</style>';
          $rep->addHeadContent($css);
        }

        return $rep;
    }
}
