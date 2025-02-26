// @ts-check
import { test, expect } from '@playwright/test';
import { LizmapMapbuilderMainPage } from './pom/lizmap-mapbuilder-main-page';
import { getAuthStorageStatePath } from "./globals";

test.describe('Build with multiple layers', () => {

    test.use({ storageState: getAuthStorageStatePath('admin') });

    test.beforeEach(async ({ page }) => {
        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.goto();

        // First row for both

        const listFolder = await lizmapMapbuilderMainPage.getListFolder();

        for (let i = 0; i < listFolder.length; i++) {
            await listFolder[i].click();
        }

        // Second row for both
        await page.locator('li.layer-store-arrow.lazy:nth-child(2)').click()
        await page.locator('li.layer-store-arrow.lazy').last().click()

        await page.waitForTimeout(500);

        // Tree all deployed
        // Add layers on map

        await page.locator('.layer-store-layer').first().click();
        await page.locator('.layer-store-layer').last().click();
    });

    test('Remove layer', async ({ page }) => {
        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openSelectedLayersDock();

        await lizmapMapbuilderMainPage.deleteLayer(0);

        const amountLayerSelected = await lizmapMapbuilderMainPage.selectedLayerHolder.locator('lizmap-layer-selected').count();

        await expect(amountLayerSelected).toEqual(1);
    });

    test('Switch layers with buttons', async ({ page }) => {

        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openSelectedLayersDock();

        const firstLayer = await lizmapMapbuilderMainPage.getSpecificLayer(0);
        const firstLayerId = await firstLayer.getAttribute('id');

        const secondLayer = await lizmapMapbuilderMainPage.getSpecificLayer(1);
        const secondLayerId = await secondLayer.getAttribute('id');

        await firstLayer.locator('div.change-order-down').first().click();

        await expect(await lizmapMapbuilderMainPage.getSpecificLayer(0)).toHaveAttribute('id', secondLayerId);
        await expect(await lizmapMapbuilderMainPage.getSpecificLayer(1)).toHaveAttribute('id', firstLayerId);
    });

    test('Drag\'n Drop', async ({ page }) => {
        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openSelectedLayersDock();

        const firstLayer = await lizmapMapbuilderMainPage.getSpecificLayer(0)
        const firstLayerId = await firstLayer.getAttribute('id');

        const secondLayer = await lizmapMapbuilderMainPage.getSpecificLayer(1)
        const secondLayerId = await secondLayer.getAttribute('id');

        await firstLayer.dragTo(secondLayer);

        await expect(await lizmapMapbuilderMainPage.getSpecificLayer(0)).toHaveAttribute('id', secondLayerId);
        await expect(await lizmapMapbuilderMainPage.getSpecificLayer(1)).toHaveAttribute('id', firstLayerId);
    });

    test('Legend is filled', async ({ page }) => {
        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openLegendDock();

        const elementsLegend = await lizmapMapbuilderMainPage.getLegendElements();

        await expect(elementsLegend.length).toEqual(2);
    });

    test('Handle extent filter', async ({ page }) => {

        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openLayerStoreDock();

        await page.locator('li.layer-store-arrow.lazy:nth-child(1)').click()
        await page.waitForTimeout(250);
        await page.locator('.layer-store-layer').first().click();

        const parentLocator = lizmapMapbuilderMainPage.layerStoreHolder.locator('.layer-store-tree');
        let childrenCount = await parentLocator.locator(':scope > ul').count();

        expect(childrenCount).toEqual(5);

        await lizmapMapbuilderMainPage.setLayerStoreExtentFilter();

        childrenCount = await parentLocator.locator(':scope > ul').count();

        expect(childrenCount).toEqual(2);
    });
});
