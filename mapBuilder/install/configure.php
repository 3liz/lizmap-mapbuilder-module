<?php
/**
 * @package   lizmap
 * @subpackage mapBuilder
 * @author    3liz
 * @copyright 2018-2022 3liz
 * @link      http://3liz.com
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */
use Jelix\Installer\Module\API\ConfigurationHelpers;

/**
 * Configurator for Lizmap 3.6+
 */
class mapBuilderModuleConfigurator extends \Jelix\Installer\Module\Configurator
{
    public function getDefaultParameters()
    {
        return array( );
    }

    public function configure(ConfigurationHelpers $helpers)
    {
        // Copy CSS and JS assets
        $helpers->copyDirectoryContent('../www/css', \jApp::wwwPath('mapBuilder/css'));
        $helpers->copyDirectoryContent('../www/js/dist', \jApp::wwwPath('mapBuilder/js'));
    }
}
