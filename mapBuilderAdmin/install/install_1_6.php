<?php

/**
 * @author    your name
 * @copyright 2018-2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */

/**
 * @deprecated for Lizmap 3.4/3.5 only
 */
class mapBuilderAdminModuleInstaller extends jInstallerModule
{
    public function install()
    {
        if ('admin' == $this->entryPoint->getEpId()) {
            $localConfigIni = $this->entryPoint->localConfigIni->getMaster();

            $adminControllers = $localConfigIni->getValue('admin', 'simple_urlengine_entrypoints');
            $mbCtrl = 'mapBuilderAdmin~*@classic';
            if (false === strpos($adminControllers, $mbCtrl)) {
                // let's register mapBuilderAdmin controllers
                $adminControllers .= ', '.$mbCtrl;
                $localConfigIni->setValue('admin', $adminControllers, 'simple_urlengine_entrypoints');
            }
        }
    }
}
