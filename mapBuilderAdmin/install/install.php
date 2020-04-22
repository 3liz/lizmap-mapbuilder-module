<?php
/**
* @package   lizmap
* @subpackage mapBuilderAdmin
* @author    your name
* @copyright 2011-2018 3liz
* @link      http://3liz.com
* @license    All rights reserved
*/


class mapBuilderAdminModuleInstaller extends jInstallerModule {

    function install() {
        if ($this->entryPoint->getEpId() == 'admin') {
            $localConfigIni = $this->entryPoint->localConfigIni->getMaster();

            $adminControllers = $localConfigIni->getValue('admin', 'simple_urlengine_entrypoints');
            $mbCtrl = 'mapBuilderAdmin~*@classic';
            if (strpos($adminControllers, $mbCtrl) === false) {
                // let's register mapBuilderAdmin controllers
                $adminControllers .= ', '.$mbCtrl;
                $localConfigIni->setValue('admin', $adminControllers, 'simple_urlengine_entrypoints');
            }
        }
    }
}
