import { test as teardown } from '@playwright/test';
import { Page } from '@playwright/test';
import { auth_using_login } from './globals';
import path from "path";

/**
 * Performs the removal of the Cats project from the map
 * @param {Page} page The page object
 */
export async function removeCatProjectToMap(page) {
  await page.goto('admin.php/admin/maps/removeSection?repository=cats');
}

teardown('remove cats project', async ({ page }) => {
  await auth_using_login(page, 'admin', 'admin', path.join(__dirname, './.auth/admin.json'));
  await removeCatProjectToMap(page);
});
