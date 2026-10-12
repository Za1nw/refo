import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Single source of truth for discovering enabled Laravel modules
 * (nwidart/laravel-modules) that expose an admin frontend.
 *
 * IMPORTANT: this does NOT depend on any module's vite.config.js, its
 * own stub, or nwidart's generator at all — it only reads
 * modules_statuses.json and checks the filesystem directly. That means
 * it works regardless of which stub set / fork of the package is
 * active, and requires zero vendor or stub edits.
 *
 * A module qualifies when:
 *   1. its entry in modules_statuses.json is `true`, and
 *   2. Modules/<name>/resources/assets/admin exists as a directory.
 *
 * @param {string} root - absolute path to the project root
 * @returns {Promise<Array<{ name: string, adminDir: string }>>}
 */
export async function getEnabledModulesWithAdminAssets(root = __dirname) {
    const statusesPath = path.join(root, 'modules_statuses.json');
    const modulesRoot = path.join(root, 'Modules');

    let statuses;
    try {
        statuses = JSON.parse(await fs.readFile(statusesPath, 'utf-8'));
    } catch (error) {
        console.error(`[module-discovery] Unable to read modules_statuses.json: ${error.message}`);
        return [];
    }

    const enabledModuleNames = Object.entries(statuses)
        .filter(([, enabled]) => enabled === true)
        .map(([name]) => name);

    const results = [];

    for (const name of enabledModuleNames) {
        const adminDir = path.join(modulesRoot, name, 'resources/assets/admin');

        try {
            const stat = await fs.stat(adminDir);
            if (stat.isDirectory()) {
                results.push({ name, adminDir });
            }
        } catch {
            // No admin assets directory for this module yet — skip it.
        }
    }

    return results;
}
