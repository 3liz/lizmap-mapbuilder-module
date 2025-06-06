<?php

/**
 * @author    3liz
 * @copyright 2018-2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */ class mapBuilderModuleUpgrader_toggleattributetable extends jInstallerModule
{
    public $targetVersions = array(
        '1.0.0-rc.13',
    );
    public $date = '2019-02-28';

    public function install()
    {
        // Add new parameter in config file to toggle attribute table tool
        $ini = new jIniFileModifier(jApp::varconfigPath('mapBuilder.ini.php'));
        $ini->setValue('attributeTableTool', 'true');
        $ini->save();
    }
}
