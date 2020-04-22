<?php
/**
* @package   lizmap
* @subpackage mapBuilder
* @author    3liz
* @copyright 2018-2020 3liz
* @link      http://3liz.com
* @license   Mozilla Public License : http://www.mozilla.org/MPL/
*/

class mapBuilderModuleUpgrader_acl extends jInstallerModule {

    public $targetVersions = array(
        '1.0.0-rc.13'
    );
    public $date = '2019-02-28';

    function install() {
        if ($this->firstExec('acl2') ) {
            $this->useDbProfile('auth');

            // Add rights group
            jAcl2DbManager::addSubjectGroup ('mapBuilder.subject.group', 'mapBuilder~default.acl.subject.group.name');

            // Add right subject
            jAcl2DbManager::addSubject( 'mapBuilder.access', 'mapBuilder~default.acl.subject.access.name', 'mapBuilder.subject.group');
            jAcl2DbManager::addSubject( 'mapBuilder.mapcontext.public.manage', 'mapBuilder~default.acl.subject.mapcontext.public.manage', 'mapBuilder.subject.group');

            // Add rights on group admins
            jAcl2DbManager::addRight('admins', 'mapBuilder.access');
            jAcl2DbManager::addRight('admins', 'mapBuilder.mapcontext.public.manage');
        }
    }
}
