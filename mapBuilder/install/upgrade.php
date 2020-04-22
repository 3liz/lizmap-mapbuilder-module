<?php
/**
* @package   lizmap
* @subpackage mapBuilder
* @author    3liz
* @copyright 2018-2020 3liz
* @link      http://3liz.com
* @license   Mozilla Public License : http://www.mozilla.org/MPL/
*/

class mapBuilderModuleUpgrader extends jInstallerModule {

    function install() {
        // Copy CSS and JS assets
        $this->copyDirectoryContent('../www/css', jApp::wwwPath('mapBuilder/css'), true);
        $this->copyDirectoryContent('../www/js/dist', jApp::wwwPath('mapBuilder/js'), true);
    }
}
