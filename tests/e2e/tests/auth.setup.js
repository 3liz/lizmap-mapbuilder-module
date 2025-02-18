import { test as setup } from '@playwright/test';
import { Page } from '@playwright/test';
import { auth_using_login, getAuthStorageStatePath } from './globals';

/**
 * Performs the authentication steps
 * @param {Page} page The page object
 */
export async function setEmptyBaseLayer(page) {
  await page.goto('admin.php/mapBuilderAdmin/config/modify');

  const checked = await page.getByRole('checkbox', {name: 'No base map'}).isChecked();

  if (!checked) {
    await page.getByRole('checkbox', {name: 'No base map'}).click();
  }

  const locator = page.locator('#jforms_mapBuilderAdmin_config_baseLayerDefault');
  await locator.selectOption('emptyBaselayer');

  const save = page.locator('#jforms_mapBuilderAdmin_config__submit');
  await save.click();
}

setup('authenticate as admin and add map', async ({ page }) => {
  await auth_using_login(page, 'admin', 'admin', getAuthStorageStatePath('admin'));
  await setEmptyBaseLayer(page);
});
