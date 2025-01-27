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
use Jelix\Routing\UrlMapping\EntryPointUrlModifier;
use Jelix\Routing\UrlMapping\MapEntry\MapInclude;

/**
 * Configurator for Lizmap 3.6+.
 */
class mapBuilderAdminModuleConfigurator extends Configurator
{
    public function getDefaultParameters()
    {
        return [];
    }

    public function declareUrls(EntryPointUrlModifier $registerOnEntryPoint)
    {
        $registerOnEntryPoint->havingName(
            'admin',
            array(
                new MapInclude('urls.xml'),
            )
        );
    }

    public function configure(ConfigurationHelpers $helpers) {}
}
