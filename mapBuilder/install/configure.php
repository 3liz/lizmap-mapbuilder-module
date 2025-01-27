<?php

/**
 * @author    3liz
 * @copyright 2018-2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */
use Jelix\Installer\Module\API\ConfigurationHelpers;
use Jelix\Installer\Module\Configurator;

/**
 * Configurator for Lizmap 3.6+.
 */
class mapBuilderModuleConfigurator extends Configurator
{
    public function getDefaultParameters()
    {
        return [];
    }

    public function configure(ConfigurationHelpers $helpers)
    {
        // Copy CSS and JS assets
        $helpers->copyDirectoryContent('../www/css', jApp::wwwPath('mapBuilder/css'));
        $helpers->copyDirectoryContent('../www/js/dist', jApp::wwwPath('mapBuilder/js'));
    }
}
