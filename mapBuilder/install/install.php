<?php
/**
 * @author    3liz
 * @copyright 2018-2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */
class mapBuilderModuleInstaller extends jInstallerModule
{
    public function install()
    {
        // Copy CSS and JS assets
        $this->copyDirectoryContent('../www/css', jApp::wwwPath('mapBuilder/css'));
        $this->copyDirectoryContent('../www/js/dist', jApp::wwwPath('mapBuilder/js'));

        // Copy conf file
        $this->copyDirectoryContent('conf', jApp::configPath());

        // SQL for map context
        if ($this->firstDbExec()) {
            // Add mapcontext table
            $this->useDbProfile('jauth');
            $this->execSQLScript('sql/mapcontext');
        }

        // Set ACL
        if ($this->firstExec('acl2')) {
            $this->useDbProfile('auth');

            // Add rights group
            jAcl2DbManager::addSubjectGroup('mapBuilder.subject.group', 'mapBuilder~default.acl.subject.group.name');

            // Add right subject
            jAcl2DbManager::addSubject('mapBuilder.access', 'mapBuilder~default.acl.subject.access.name', 'mapBuilder.subject.group');
            jAcl2DbManager::addSubject('mapBuilder.mapcontext.public.manage', 'mapBuilder~default.acl.subject.mapcontext.public.manage', 'mapBuilder.subject.group');

            // Add rights on group admins
            jAcl2DbManager::addRight('admins', 'mapBuilder.access');
            jAcl2DbManager::addRight('admins', 'mapBuilder.mapcontext.public.manage');
        }
    }
}
