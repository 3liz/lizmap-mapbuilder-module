exports.LizmapMapbuilderAdminPreviewPage = class LizmapMapbuilderAdminPreviewPage {

    /**
     * Constructor for initializing the Admin page where we can check the configuration of MapBuilder.
     * @param {import('@playwright/test').Page} page - The page object representing the current browser context.
     */
    constructor(page) {
        this.page = page;
        this.zoomInButton = page.locator("button.ol-zoom-in");
        this.zoomOutButton = page.locator("button.ol-zoom-out");
        this.zoomToSelectedExtentButton = page.locator("#preview > button");
        this.map = page.locator("#map");

        this.repositorySpan = page.locator("#_repository");
        this.extentSpan = page.locator("#_extent");
        this.baseLayerSpan = page.locator("#_baseLayer");
        this.baseLayerDefaultSpan = page.locator("#_baseLayerDefault");
        this.baseLayerKeyBingSpan = page.locator("#_baseLayerKeyBing");
        this.attributeTableToolSpan = page.locator("#_attributeTableTool");

        this.modifyButton = page.locator(".form-actions > a.btn")
    }

    /**
     * Navigates to the config's preview page.
     */
    async goto() {
        await this.page.goto('admin.php/mapBuilderAdmin/config');
    }
};
