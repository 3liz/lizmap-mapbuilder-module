<?php
/**
* @package   lizmap
* @subpackage mapBuilder
* @author    3liz
* @copyright 2011-2019 3liz
* @link      http://3liz.com
* @license   Mozilla Public License : http://www.mozilla.org/MPL/
*/


class mapBuilderModuleInstaller extends jInstallerModule {

    function install() {
        // Copy CSS and JS assets
        $this->copyDirectoryContent(jApp::getModulePath('mapBuilder').'/www/css', jApp::wwwPath('mapBuilder/css'));
        $this->copyDirectoryContent(jApp::getModulePath('mapBuilder').'/www/dist', jApp::wwwPath('mapBuilder/js'));

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