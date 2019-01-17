<?php
class mapBuilderModuleUpgrader extends jInstallerModule {

    public $targetVersions = array(
        'v1.0.0-rc.8'
    );
    public $date = '2019-01-17';

    function install() {
        // Add mapcontext table
        if( $this->firstDbExec() ) {
            $this->useDbProfile('jauth');
            $this->execSQLScript('sql/mapcontext');
        }
    }
}
