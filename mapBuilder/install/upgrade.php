<?php

use Jelix\Installer\Module\API\InstallHelpers;
use Jelix\Installer\Module\Installer;

/**
 * @author    3liz
 * @copyright 2018-2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */
class mapBuilderModuleUpgrader extends Installer
{
    public function install(InstallHelpers $helpers)
    {
        // Copy CSS and JS assets
        $helpers->copyDirectoryContent('../www/css', jApp::wwwPath('mapBuilder/css'), true);
        $helpers->copyDirectoryContent('../www/js/dist', jApp::wwwPath('mapBuilder/js'), true);
    }
}
