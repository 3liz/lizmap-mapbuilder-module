<?php
/**
* @package   lizmap
* @subpackage mapBuilder
* @author    your name
* @copyright 2011-2018 3liz
* @link      http://3liz.com
* @license    All rights reserved
*/


class mapBuilderModuleInstaller extends jInstallerModule {

    function install() {
    	// Copy this CSS
        $this->copyDirectoryContent('../www/css/skin-win8', jApp::wwwPath('mapBuilder/skin-win8'));
    }
}