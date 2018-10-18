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
    	// TODO : put code in class
    	// TODO : deal with ACL
    	// TODO? : create tree in JSON then load it with fancytree
    	
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

        $rep->bodyTpl = 'mapBuilder~main';

        $services = lizmap::getServices();

        $repository = lizmap::getRepository($services->defaultRepository);

        $nestedTree = array();
        
        $repositories = lizmap::getRepositoryList();

        foreach ($repositories as $key => $repositoryName) {
        	$repository = lizmap::getRepository($repositoryName);

        	$nestedTree[$repositoryName]['label'] = $repository->getData('label');
        	$projects = $repository->getProjects();

        	foreach ($projects as $project) {
        		$nestedTree[$repositoryName]['projects'][$project->getKey()] = $project->getData('title');
        	}
        }

        $rep->body->assign('nestedTree', $nestedTree);

        return $rep;
    }
}

