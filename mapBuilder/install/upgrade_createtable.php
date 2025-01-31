<?php

/**
 * @author    3liz
 * @copyright 2018-2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */ class mapBuilderModuleUpgrader_createtable extends jInstallerModule
{
    public $targetVersions = array(
        '1.0.0-rc.10',
    );
    public $date = '2019-01-25';

    public function install()
    {
        // Add mapcontext table
        if ($this->firstDbExec()) {
            $this->useDbProfile('jauth');
            $this->execSQLScript('sql/mapcontext');
        }
    }
}
