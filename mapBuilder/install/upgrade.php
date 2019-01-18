<?php
class mapBuilderModuleUpgrader extends jInstallerModule {

    function install() {
        // Copy this CSS
        $this->copyDirectoryContent('../www/css/skin-awesome', jApp::wwwPath('mapBuilder/skin-awesome'));
        $this->copyDirectoryContent('../www/css/fontawesome-free-web', jApp::wwwPath('mapBuilder/fontawesome-free-web'));
    }
}
