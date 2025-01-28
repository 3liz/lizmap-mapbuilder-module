import { test, expect } from '@playwright/test';

test.describe('Build with multiple layers', () => {

  test.beforeEach(async ({ page }) => {
    const url = '/index.php/mapBuilder';
    await page.goto(url);

    // First row for both

    const listFolder = await page.locator('#layerStoreHolder > ul > li.layerStore-arrow').all();

    for (let i = 0; i < listFolder.length; i++) {
      await listFolder[i].click();
    }

    // Second row for both

    const listLazyLayers = await page.locator('li.layerStore-arrow.lazy').all()

    for (let i = 0; i < listLazyLayers.length; i++) {
      await listLazyLayers[i].click();
    }

    await page.waitForTimeout(500);

    // Third row for cats

    await page.locator('li.layerStore-arrow').last().click();

    // Tree all deployed
    // Add layers on map

    await page.locator('.layerStore-layer').first().click();
    await page.locator('.layerStore-layer').last().click();

    await page.locator('id=layerselection-tab').click();
  });

  test('Remove layer', async ({ page }) => {

    await page.locator('button.deleteLayerButton').last().click();

    const amountLayerSelected = await page.locator('lizmap-layer-selected').count();

    await expect(amountLayerSelected).toEqual(1);
  });

  test('Switch layers with buttons', async ({ page }) => {

    const firstLayer = await page.locator('lizmap-layer-selected').first();
    const firstLayerId = await firstLayer.getAttribute('id');

    const secondLayerId = await page.locator('lizmap-layer-selected').last().getAttribute('id');

    await firstLayer.locator('div.changeOrderDown').first().click();

    await expect(await page.locator('lizmap-layer-selected').first().getAttribute('id')).toEqual(secondLayerId);
    await expect(await page.locator('lizmap-layer-selected').last().getAttribute('id')).toEqual(firstLayerId);
  });

  test('Drag\'n Drop', async ({ page }) => {

    const firstLayer = await page.locator('lizmap-layer-selected').first();
    const firstLayerId = await firstLayer.getAttribute('id');

    const secondLayer = await page.locator('lizmap-layer-selected').last();
    const secondLayerId = await secondLayer.getAttribute('id');

    await firstLayer.dragTo(secondLayer);

    await expect(await page.locator('lizmap-layer-selected').first().getAttribute('id')).toEqual(secondLayerId);
    await expect(await page.locator('lizmap-layer-selected').last().getAttribute('id')).toEqual(firstLayerId);
  });

  test('Open/Close attribute table', async ({ page }) => {

    await page.locator('button.dispayDataButton').click();

    const attributeTable = await page.locator('#bottom-dock');

    await expect(attributeTable).toHaveCSS("display", "block");

    await page.locator("#bottom-dock i.fas.fa-times").click();

    await expect(attributeTable).toHaveCSS("display", "none");
  });

  test('Legend is filled', async ({ page }) => {

    const amountElementLegend = await page.locator('#legend-content > div').count();

    await expect(amountElementLegend).toEqual(2);
  });
});
