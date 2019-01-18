<?php
class mapBuilderModuleUpgrader extends jInstallerModule {

    function install() {
        // Copy this CSS
        $this->copyDirectoryContent('../www/css/skin-awesome', jApp::wwwPath('mapBuilder/skin-awesome'));
        $this->copyDirectoryContent('../www/css/fontawesome-free-5.6.3-web', jApp::wwwPath('mapBuilder/fontawesome-free-5.6.3-web'));
    }
}
