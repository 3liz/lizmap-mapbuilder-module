<?php
/**
* @package   lizmap
* @subpackage mapBuilder
* @author    3liz
* @copyright 2018-2022 3liz
* @link      http://3liz.com
* @license   Mozilla Public License : http://www.mozilla.org/MPL/
*/

class mapBuilderModuleInstaller extends  \Jelix\Installer\Module\Installer
{
    public function install(Jelix\Installer\Module\API\InstallHelpers $helpers)
    {
        // Add mapcontext table
        $helpers->database()->useDbProfile('jauth');
        $helpers->database()->execSQLScript('sql/mapcontext');

        // Set ACL
        $helpers->database()->useDbProfile('auth');

        // Add rights group
        jAcl2DbManager::createRightGroup('mapBuilder.subject.group', 'mapBuilder~default.acl.subject.group.name');

        // Add right subject
        jAcl2DbManager::createRight('mapBuilder.access', 'mapBuilder~default.acl.subject.access.name', 'mapBuilder.subject.group');
        jAcl2DbManager::createRight('mapBuilder.mapcontext.public.manage', 'mapBuilder~default.acl.subject.mapcontext.public.manage', 'mapBuilder.subject.group');

        // Add rights on group admins
        jAcl2DbManager::addRight('admins', 'mapBuilder.access');
        jAcl2DbManager::addRight('admins', 'mapBuilder.mapcontext.public.manage');
    }
}
