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
        //if ($this->firstDbExec())
        //    $this->execSQLScript('sql/install');

        /*if ($this->firstExec('acl2')) {
            jAcl2DbManager::addSubject('my.subject', 'mapBuilderAdmin~acl.my.subject', 'subject.group.id');
            jAcl2DbManager::addRight('admins', 'my.subject'); // for admin group
        }
        */
        if ($this->entryPoint->getEpId() == 'admin') {
            // check first if localconfig has already redefined the list of controllers
            $adminControllers = $this->entryPoint->localConfigIni->getValue('admin', 'simple_urlengine_entrypoints');
            if (!$adminControllers) {
                // not in localconfig, retrieve list from mainconfig
                $adminControllers = $this->entryPoint->configIni->getValue('admin', 'simple_urlengine_entrypoints');
            }
            $mbCtrl = 'mapBuilderAdmin~*@classic';
            if (strpos($adminControllers, $mbCtrl) === false) {
                // let's register mapBuilderAdmin controllers
                $adminControllers .= ', '.$mbCtrl;
                $this->entryPoint->localConfigIni->setValue('admin', $adminControllers, 'simple_urlengine_entrypoints');
            }
        }
    }
}