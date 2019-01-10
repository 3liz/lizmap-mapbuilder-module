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
        $this->copyDirectoryContent('../www/css/skin-awesome', jApp::wwwPath('mapBuilder/skin-awesome'));
        $this->copyDirectoryContent('../www/css/fontawesome-free-5.4.1-web', jApp::wwwPath('mapBuilder/fontawesome-free-5.4.1-web'));
        // Copy conf file
        $this->copyDirectoryContent('conf', jApp::configPath());

        // SQL for map context
        if ($this->firstDbExec()) {
            // Add mapcontext table
            $this->useDbProfile('jauth');
            $this->execSQLScript('sql/mapcontext');
        }
    }
}