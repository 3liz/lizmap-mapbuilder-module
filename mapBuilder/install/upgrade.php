<?php
/**
* @package   lizmap
* @subpackage mapBuilder
* @author    3liz
* @copyright 2011-2019 3liz
* @link      http://3liz.com
* @license   Mozilla Public License : http://www.mozilla.org/MPL/
*/

class mapBuilderModuleUpgrader extends jInstallerModule {

    function install() {
        // Copy CSS and JS assets
        $this->copyDirectoryContent(jApp::getModulePath('mapBuilder').'/www/css', jApp::wwwPath('mapBuilder/css'));
        $this->copyDirectoryContent(jApp::getModulePath('mapBuilder').'/www/js/dist', jApp::wwwPath('mapBuilder/js'));
    }
}
