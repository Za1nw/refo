import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

import { getEnabledModulesWithAdminAssets } from './module-discovery.js';

/**
 * Collect extra Vite resolve paths exported by each enabled module's own
 * vite.config.js (if it happens to have one) — purely optional/additive,
 * nothing here depends on a module having a stub-generated config, so
 * modules created before or after any stub change all work the same way.
 *
 * @param {string[]} paths - array to append discovered paths into
 * @param {string} root - absolute path to the project root
 */
async function collectModuleAssetsPaths(paths, root) {
    const modules = await getEnabledModulesWithAdminAssets(root);

    for (const { name } of modules) {
        const viteConfigPath = path.join(root, 'Modules', name, 'vite.config.js');

        try {
            await fs.access(viteConfigPath);
            const moduleConfig = await import(pathToFileURL(viteConfigPath).href);

            if (Array.isArray(moduleConfig.paths)) {
                paths.push(...moduleConfig.paths);
            }
        } catch {
            // No vite.config.js for this module (or it failed to load) — skip.
        }
    }

    return paths;
}

export default collectModuleAssetsPaths;
