<?php

use Jelix\Installer\Module\API\InstallHelpers;
use Jelix\Installer\Module\Installer;

/**
 * @author    3liz
 * @copyright 2018-2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */

/**
 * Installer for Lizmap 3.6+.
 */
class mapBuilderModuleInstaller extends Installer
{
    public function install(InstallHelpers $helpers)
    {
        // Copy conf file
        $helpers->copyDirectoryContent('conf', jApp::varconfigPath());

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
