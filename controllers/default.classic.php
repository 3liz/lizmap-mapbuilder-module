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
    	// TODO : copy assets locally
    	// TODO : deal with ACL
    	// TODO? : create tree in JSON then load it with fancytree
    	
        $rep = $this->getResponse('html', true);// true désactive le template général
        $rep->title = "Map Builder";
        // Assets
        $rep->addCSSLink('https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.2.0/css/ol.css');
        // $rep->addCSSLink('https://cdn.jsdelivr.net/npm/jquery.fancytree@2.30.0/dist/skin-bootstrap/ui.fancytree.min.css');
        $rep->addCSSLink('https://cdn.jsdelivr.net/npm/jquery.fancytree@2.30.0/dist/skin-win8/ui.fancytree.min.css');

        // $rep->addCSSLink('https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css');

        $rep->addStyle('.map', 'height: 400px;width: 100%;');

        $rep->addJSLink('https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.2.0/build/ol.js');

        $rep->addJSLink('https://code.jquery.com/jquery-3.3.1.min.js');

        // $rep->addJSLink('https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js');
        // $rep->addJSLink('https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js');

        $rep->addJSLink('https://cdn.jsdelivr.net/npm/jquery.fancytree@2.30.0/dist/jquery.fancytree-all-deps.min.js');

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

