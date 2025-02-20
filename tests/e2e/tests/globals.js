import { Page } from '@playwright/test';
import { LizmapConnectionPage } from './pom/lizmap-connection-page'
import path from 'path';

/**
 * Performs the authentication steps
 * @param {Page} page The page object
 * @param {string} login The login
 * @param {string} password The password
 * @param {string} user_file The path to the file where the cookies will be stored
 */
export async function authUsingLogin(page, login, password, user_file) {
    const lizmapConnectionPage = new LizmapConnectionPage(page)

    await lizmapConnectionPage.goto();

    await lizmapConnectionPage.connect(login, password);

    await page.waitForURL('index.php');

    // End of authentication steps.
    await page.context().storageState({ path: user_file });
}

/**
 * Get the current file path according the list of given arguments.
 * @returns {string} The final file path
 */
export function playwrightTestFile()   {
    let finalPath = path.join(__dirname);
    for (let i = 0; i < arguments.length; i++) {
        finalPath = path.join(finalPath, arguments[i]);
    }
    return finalPath;
}

/**
 * Get the auth storage state path
 * @param {string} name The file name without extension
 * @returns {string} The path to auth storage state path
 */
export function getAuthStorageStatePath(name) {
    return playwrightTestFile('.auth', name + '.json');
}
