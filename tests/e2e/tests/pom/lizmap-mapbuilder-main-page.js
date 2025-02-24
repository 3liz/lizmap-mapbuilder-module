exports.LizmapMapbuilderMainPage = class LizmapMapbuilderMainPage {

    /**
     * Constructor for the class that initializes the map page.
     * @param {import('@playwright/test').Page} page - The page object representing the current browser context.
     */
    constructor(page) {
        this.page = page;

        this.map = page.locator("#map");

        this.zoomInButton = page.locator("button.ol-zoom-in");
        this.zoomOutButton = page.locator("button.ol-zoom-out");
        this.zoomToRectangleButton = page.locator("div.ol-drag-zoom > button");
        this.zoomToSelectedExtentButton = page.locator("#preview > button");

        this.closeDockButton = page.locator("#dock-close > button")

        // Nav tabs buttons
        this.layerStoreNavItem = page.locator("#layerswitcher-tab");
        this.selectedLayersNavItem = page.locator("#layerselection-tab");
        this.legendNavItem = page.locator("#legend-tab");
        this.printNavItem = page.locator("#pdf-print-tab");
        this.dataNavItem = page.locator("#attribute-btn");
        this.myMapsNavItem = page.locator("#mapcontext-tab");

        // Layer Store nav
        this.layerStoreHolder = page.locator("#layer-store-holder");
        this.baseLayerSelect = page.locator("#baseLayerSelect");

        // Selected Layers nav
        this.selectedLayerHolder = page.locator("#layer-selected-holder");

        // PDF print nav
        this.pdfTitleInput = page.locator("#pdf-print-title");
        this.pdfResolutionSelect = page.locator("#resolution-pdf-print");
        this.printButton = page.locator("#pdf-print-btn");

        // My maps nav
        this.mapTitleInput = page.locator("#mapcontext-name");
        this.publicMapContextCheckbox = page.locator("#publicmapcontext");
        this.saveMapContextButton = page.locator("#mapcontext-add-btn")
    }

    /**
     * Navigates to the mapBuilder main page.
     */
    async goto() {
        await this.page.goto('index.php/mapBuilder');
    }

    /**
     * Closes the left dock by simulating a click action on the dock close button.
     */
    async closeDock() {
        await this.closeDockButton.click();
    }

    /**
     * Opens the Layer Store dock.
     */
    async openLayerStoreDock() {
        await this.layerStoreNavItem.click();
    }

    /**
     * Opens the dock for selected layers.
     */
    async openSelectedLayersDock() {
        await this.selectedLayersNavItem.click();
    }

    /**
     * Opens the legend dock.
     */
    async openLegendDock() {
        await this.legendNavItem.click();
    }

    /**
     * Opens the print PDF dock.
     */
    async openPrintPDFDock() {
        await this.printNavItem.click();
    }

    /**
     * Opens the attribute table for the specified selected layer by its name.
     * @param {string} name - The name of the layer in the selected layers.
     */
    async openAttributeTable(name) {
        await this.openSelectedLayersDock();

        const layerList = await this.page.locator("lizmap-layer-selected").all();

        for (const layer of layerList) {
            const layerTitle = await layer.locator(".title-layer-selected").innerText();
            if (layerTitle === name) {
                const button = await layer.locator(".displayDataButton");
                await button.click();
                break;
            }
        }
    }

    /**
     * Opens the attribute table from the left navigation bar.
     */
    async openAttributeTableFromLeftBar() {
        await this.dataNavItem.click();
    }

    /**
     * Opens the "My Maps" dock.
     */
    async openMyMapsDock() {
        await this.myMapsNavItem.click();
    }

    /**
     * Closes the attribute table in the user interface. If no index is provided or the index
     * value is less than 0, the default action will hide the bottom dock panel. Otherwise, it
     * will close a specific attribute layer tab based on the provided index.
     * @param {number} [index] The index of the attribute layer tab to close (from left to right). If not specified
     * or less than 0, the bottom dock will be closed instead.
     */
    async closeAttributeTable(index = -1) {
        if (index < 0) {
            await this.page.locator("#hideBottomDock").click();
        } else {
            await this.page.locator("#attribute-layers-tabs > li:nth-child(" + (index + 2) + ") > a > i").click();
        }
    }

    /**
     * Fetches all folder elements from the layer store holder.
     * @returns {Array<import('@playwright/test').Locator>} A promise that resolves to an array of locator elements representing the folder list.
     */
    async getListFolder() {
        return await this.page.locator('#layer-store-holder > ul > li.layer-store-arrow').all();
    }

    /**
     * Deletes a layer from the list based on the given index.
     * @param {number} index - The index of the layer to be deleted from the list of layers.
     */
    async deleteLayer(index) {
        await this.openSelectedLayersDock();
        const listDeleteButton = await this.page.locator('button.delete-layer-button').all()
        await listDeleteButton[index].click();
    }

    /**
     * Retrieves a specific layer from the selected layers.
     * @param {number} index - The index of the layer.
     * @returns {import('@playwright/test').Locator} A locator pointing on the layer.
     */
    async getSpecificLayer(index) {
        await this.openSelectedLayersDock();
        const listLayers = await this.page.locator('lizmap-layer-selected').all();
        return listLayers[index];
    }

    /**
     * Retrieves all elements located within the legend.
     * @returns {Array<import('@playwright/test').Locator>} Array of Locator pointing on each element.
     */
    async getLegendElements() {
        return await this.page.locator('#legend-content > div').all();
    }

    /**
     * Sets the layer store configuration to "No Filter".
     */
    async setLayerStoreNoFilter() {
        await this.page.locator("#filterButtonNo").click();
    }

    /**
     * Sets the layer store configuration to "Extent filter".
     */
    async setLayerStoreExtentFilter() {
        await this.page.locator("#filterButtonExtent").click();
    }

};
