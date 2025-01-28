import { test as setup } from '@playwright/test';
import path from 'path';
import { Page } from '@playwright/test';
import { auth_using_login } from './globals';

/**
 * Performs the addition of the Cats project to the map
 * @param {Page} page The page object
 */
export async function addCatProjectToMap(page) {
  await page.goto('admin.php/admin/maps/createSection');

  const locator = page.locator('id=jforms_admin_config_section_path');

  try {
    await locator.selectOption('/srv/projects/cats/');
  } catch (e) {
    console.error('Error while adding the "Cats" project, maybe already imported ? (Try again)');
  }

  await page.locator('id=jforms_admin_config_section__submit').click();
}

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

  const locator = page.locator('id=jforms_mapBuilderAdmin_config_baseLayerDefault');
  await locator.selectOption('emptyBaselayer');

  const save = page.locator('id=jforms_mapBuilderAdmin_config__submit');
  await save.click();
}

setup('authenticate as admin and add map', async ({ page }) => {
  await auth_using_login(page, 'admin', 'admin', path.join(__dirname, './.auth/admin.json'));
  await addCatProjectToMap(page);
  await setEmptyBaseLayer(page);
});
