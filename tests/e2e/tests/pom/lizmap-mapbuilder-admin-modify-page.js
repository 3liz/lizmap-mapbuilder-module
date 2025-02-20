exports.LizmapMapbuilderAdminModifyPage = class LizmapMapbuilderAdminModifyPage {

    /**
     * Constructor for initializing the Admin page where we can configure MapBuilder.
     * @param {import('@playwright/test').Page} page - The page object representing the current browser context.
     */
    constructor(page) {
        this.page = page;

        this.zoomInButton = page.locator("button.ol-zoom-in");
        this.zoomOutButton = page.locator("button.ol-zoom-out");
        this.zoomToSelectedExtentButton = page.locator("#preview > button");

        this.drawExtentButton = page.locator("div.ol-select-extent > button");

        this.undoButton = page.locator("button.ol-do-control-undo");
        this.redoButton = page.locator("button.ol-do-control-redo");

        this.map = page.locator("#map");

        this.repositorySelect = page.locator("#jforms_mapBuilderAdmin_config_repository");
        this.extentInput = page.locator("#jforms_mapBuilderAdmin_config_extent");
        this.listBaseLayerLabel = page.locator(".jforms-chkbox.jforms-ctl-baseLayer");
        this.baseLayerDefaultSelect = page.locator("#jforms_mapBuilderAdmin_config_baseLayerDefault");
        this.baseLayerKeyBingSpan = page.locator("#jforms_mapBuilderAdmin_config_baseLayerKeyBing");
        this.attributeTableToolCheckbox = page.locator("#jforms_mapBuilderAdmin_config_attributeTableTool");

        this.previousButton = page.locator(".span10 .row-fluid > div:last-of-type > a.btn")
        this.saveButton = page.locator("#jforms_mapBuilderAdmin_config__submit")
    }

    /**
     * Navigates to the config's preview page.
     */
    async goto() {
        await this.page.goto('admin.php/mapBuilderAdmin/config/modify');
    }
};
