<?php
/**
* @package   lizmap
* @subpackage mapBuilder
* @author    3liz
* @copyright 2018-2020 3liz
* @link      http://3liz.com
* @license   Mozilla Public License : http://www.mozilla.org/MPL/
*/

class mapBuilderModuleUpgrader extends \Jelix\Installer\Module\Installer {

    function install(Jelix\Installer\Module\API\InstallHelpers $helpers) {
        // Copy CSS and JS assets
        $helpers->copyDirectoryContent('../www/css', jApp::wwwPath('mapBuilder/css'), true);
        $helpers->copyDirectoryContent('../www/js/dist', jApp::wwwPath('mapBuilder/js'), true);
    }
}
