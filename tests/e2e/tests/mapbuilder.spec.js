// @ts-check
import { test, expect } from '@playwright/test';
import { LizmapMapbuilderMainPage } from './pom/lizmap-mapbuilder-main-page';
import { getAuthStorageStatePath } from "./globals";

test.describe('Build with multiple layers', () => {

    test.use({ storageState: getAuthStorageStatePath('admin') });

    test.beforeEach(async ({ page }) => {
        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.goto();

        // Open all folders
        const listFolder = await lizmapMapbuilderMainPage.getListFolder();

        for (let i = 0; i < listFolder.length; i++) {
            await listFolder[i].click();
        }

        // Second row
        await page.getByRole('listitem').filter({ hasText: 'norwayPoints' }).click();
        await page.getByRole('listitem').filter({ hasText: 'Project demo' }).click();
        await page.getByRole('listitem').filter({ hasText: 'eastPoints' }).click();
        await page.getByRole('listitem').filter({ hasText: 'Paris' }).click();

        await page.waitForTimeout(250);

        // Tree all deployed
        // Add layers on map
        await page.locator('.layer-store-layer').first().click();
        await page.locator('.layer-store-layer').nth(2).click();
    });

    test('Remove layer', async ({ page }) => {
        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openSelectedLayersDock();

        await page.waitForTimeout(250);

        await lizmapMapbuilderMainPage.deleteLayer(0);

        const amountLayerSelected = await lizmapMapbuilderMainPage.selectedLayerHolder.locator('lizmap-layer-selected').count();

        await expect(amountLayerSelected).toEqual(1);
    });

    test('Switch layers with buttons', async ({ page }) => {

        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openSelectedLayersDock();

        await page.waitForTimeout(250);

        const firstLayer = await lizmapMapbuilderMainPage.getSpecificLayer(0);
        const firstLayerId = await firstLayer.getAttribute('data-ol-uid');

        const secondLayer = await lizmapMapbuilderMainPage.getSpecificLayer(1);
        const secondLayerId = await secondLayer.getAttribute('data-ol-uid');

        await firstLayer.locator('div.change-order-down').first().click();

        await expect(await lizmapMapbuilderMainPage.getSpecificLayer(0)).toHaveAttribute('data-ol-uid', secondLayerId);
        await expect(await lizmapMapbuilderMainPage.getSpecificLayer(1)).toHaveAttribute('data-ol-uid', firstLayerId);
    });

    test('Drag\'n Drop', async ({ page }) => {
        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openSelectedLayersDock();

        await page.waitForTimeout(250);

        const firstLayer = await lizmapMapbuilderMainPage.getSpecificLayer(0)
        const firstLayerId = await firstLayer.getAttribute('data-ol-uid');

        const secondLayer = await lizmapMapbuilderMainPage.getSpecificLayer(1)
        const secondLayerId = await secondLayer.getAttribute('data-ol-uid');

        await firstLayer.dragTo(secondLayer);

        await expect(await lizmapMapbuilderMainPage.getSpecificLayer(0)).toHaveAttribute('data-ol-uid', secondLayerId);
        await expect(await lizmapMapbuilderMainPage.getSpecificLayer(1)).toHaveAttribute('data-ol-uid', firstLayerId);
    });

    test('Legend is filled', async ({ page }) => {
        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openLegendDock();

        await page.waitForTimeout(250);

        const elementsLegend = await lizmapMapbuilderMainPage.getLegendElements();

        await expect(elementsLegend.length).toEqual(2);
    });

    test('Handle extent filter', async ({ page }) => {

        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openLayerStoreDock();

        await page.waitForTimeout(250);

        await lizmapMapbuilderMainPage.setLayerStoreExtentFilter();

        await page.waitForTimeout(100);

        await expect(page.getByRole('listitem').filter({ hasText: 'Project demo' })).toBeVisible();
        await expect(page.getByRole('listitem').filter({ hasText: 'Paris' })).toBeVisible();
    });

    test('Handle keywords union filter', async ({ page }) => {

        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openLayerStoreDock();

        await lizmapMapbuilderMainPage.setLayerStoreKeywordsFilter();
        await lizmapMapbuilderMainPage.openCloseKeywordsList();

        await lizmapMapbuilderMainPage.clickOnKeyword("france");
        await lizmapMapbuilderMainPage.clickOnKeyword("east");

        await expect(page.getByRole('listitem').filter({ hasText: 'Project demo' })).toBeVisible();
        await expect(page.getByRole('listitem').filter({ hasText: 'eastPoints' })).toBeVisible();
        await expect(page.getByRole('listitem').filter({ hasText: 'Paris' })).toBeVisible();
    });

    test('Handle keywords intersection filter', async ({ page }) => {

        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openLayerStoreDock();

        await lizmapMapbuilderMainPage.setLayerStoreKeywordsFilter();
        await lizmapMapbuilderMainPage.openCloseKeywordsList();
        await lizmapMapbuilderMainPage.setIntersectionKeywordsFilter();

        await lizmapMapbuilderMainPage.clickOnKeyword("france");
        await lizmapMapbuilderMainPage.clickOnKeyword("europe");

        await expect(page.getByRole('listitem').filter({ hasText: 'Project demo' })).toBeVisible();
        await expect(page.getByRole('listitem').filter({ hasText: 'Paris' })).toBeVisible();
    });

    test('Handle extent & keywords filter', async ({ page }) => {

        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openLayerStoreDock();

        await lizmapMapbuilderMainPage.setLayerStoreKeywordsFilter();
        await lizmapMapbuilderMainPage.openCloseKeywordsList();

        await lizmapMapbuilderMainPage.clickOnKeyword("france");
        await lizmapMapbuilderMainPage.clickOnKeyword("east");

        await lizmapMapbuilderMainPage.setLayerStoreExtentFilter();

        await page.waitForTimeout(250);

        await expect(page.getByRole('listitem').filter({ hasText: 'Project demo' })).toBeVisible();
        await expect(page.getByRole('listitem').filter({ hasText: 'Paris' })).toBeVisible();
    });

    test('Handle map save', async ({ page }) => {
        const footwaysEl = await page.getByRole('listitem').filter({ hasText: 'Mapbuilder' }).locator('div');

        const footwaysBgColor = await footwaysEl.evaluate(el => window.getComputedStyle(el).backgroundColor);

        const lizmapMapbuilderMainPage = new LizmapMapbuilderMainPage(page);
        await lizmapMapbuilderMainPage.openMyMapsDock();

        await page.waitForTimeout(250);

        await lizmapMapbuilderMainPage.mapTitleInput.fill("map");
        await lizmapMapbuilderMainPage.saveMapContextButton.click();

        await page.locator(".btn-mapcontext-run");

        await lizmapMapbuilderMainPage.openSelectedLayersDock();

        await page.waitForTimeout(250);

        const amountSelected = await lizmapMapbuilderMainPage.selectedLayerHolder.locator("lizmap-layer-selected").count();

        const firstEl = await lizmapMapbuilderMainPage.selectedLayerHolder.locator("lizmap-layer-selected").nth(0).locator(".change-order-container");

        const firstElBgColor = await firstEl.evaluate(el => window.getComputedStyle(el).backgroundColor);

        await expect(amountSelected).toEqual(2);
        await expect(footwaysBgColor).toEqual(firstElBgColor);

    });
});
