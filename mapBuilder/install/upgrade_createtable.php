<?php
class mapBuilderModuleUpgrader_createtable extends jInstallerModule {

    public $targetVersions = array(
        'v1.0.0-rc.9'
    );
    public $date = '2019-01-18';

    function install() {
        // Add mapcontext table
        if( $this->firstDbExec() ) {
            $this->useDbProfile('jauth');
            $this->execSQLScript('sql/mapcontext');
        }
    }
}
