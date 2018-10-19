<?php
/**
* @package   lizmap
* @subpackage mapBuilder
* @author    your name
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
        $rep->title = "Map Builder";
        // Assets
        $rep->addCSSLinkModule('mapBuilder','css/ol-5.2.0.css');
        $rep->addCSSLink(jApp::urlBasePath().'mapBuilder/skin-win8/ui.fancytree.css');

        $rep->addStyle('.map', 'height: 400px;width: 100%;');

        $rep->addJSLinkModule('mapBuilder','js/ol-5.2.0.min.js');
        $rep->addJSLinkModule('mapBuilder','js/jquery-3.3.1.min.js');
        $rep->addJSLinkModule('mapBuilder','js/jquery.fancytree-all-deps.min.js');
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
        			"lazy" => true,
        			"repository" => $repositoryName,
        			"project" => $project->getKey()
        		];
        	}

        	$nestedTree[] = [
        		"title" => $repository->getData('label'),
        		"children" => $projectArray
        	];
        }

        // Write tree as JSON
        $rep->addJSCode('var mapBuilder = {}; mapBuilder.layerSelectionTree = '.json_encode($nestedTree).';');

        $rep->bodyTpl = 'mapBuilder~main';

        return $rep;
    }
}

