<?php
/**
* @package   lizmap
* @subpackage mapBuilder
* @author    3liz
* @copyright 2011-2019 3liz
* @link      http://3liz.com
* @license    All rights reserved
*/

class fontawesomeCtrl extends jController {
    /**
    * Load fontawesome CSS with relative paths to fonts changed to getfile Jelix paths
    */
    function index() {

    	// Prepare the file to return
	    $rep = $this->getResponse('binary');

	    // Mime type
	    $rep->mimeType = 'text/css';

	    // Read content from file
	    $content = jFile::read(jApp::getModulePath('mapBuilder').'/www/css/fontawesome-free-web/css/all.min.css');

	    // Replace relative fonts with getfile URLs
	    $baseUrl = jApp::urlBasePath()."index.php/jelix/www/getfile?targetmodule=mapBuilder&file=css/fontawesome-free-web";
	    $pattern = 'url\(\.\.(.+?)\)';
	    $replacement = 'url(' . $baseUrl . '\1)';
	    $content = preg_replace("|$pattern|", $replacement, $content);
	    $rep->content = $content;

	    $rep->setExpires('+1 days');

	    return $rep;
	}
}