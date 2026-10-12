import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { getEnabledModulesWithAdminAssets } from './module-discovery.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, 'tsconfig.paths.json');

/**
 * Build the "paths" map: the root "@/*" alias always comes first,
 * followed by one "@modules/<lowercased-name>/*" alias per module that
 * has resources/assets/admin. Names come straight from the folder name
 * on disk — no stub, no vendor code, no module-declared config involved.
 */
function buildPathsMap(modules) {
    const paths = {
        '@/*': ['./resources/admin/*'],
    };

    for (const { name, adminDir } of modules) {
        const alias = `@${name.toLowerCase()}/*`;
        const relativeDir = path
            .relative(__dirname, adminDir)
            .split(path.sep)   // Windows-safe: force forward slashes for tsconfig
            .join('/');

        paths[alias] = [`./${relativeDir}/*`];
    }

    return paths;
}

/**
 * Regenerate tsconfig.paths.json purely from what's actually on disk.
 * tsconfig.json should `extend` this file rather than declare its own
 * `paths`, so this is the only place TS aliases live.
 *
 * Writes are skipped when content is unchanged, to avoid noisy
 * file-watcher/TS-server reload loops during `vite dev`.
 *
 * @param {string} root - absolute path to the project root
 */
export async function generateTsconfigPaths(root = __dirname) {
    const modules = await getEnabledModulesWithAdminAssets(root);

    const content = {
        compilerOptions: {
            paths: buildPathsMap(modules),
        },
    };

    const json = `${JSON.stringify(content, null, 4)}\n`;

    try {
        const existing = await fs.readFile(OUTPUT_FILE, 'utf-8');
        if (existing === json) {
            return;
        }
    } catch {
        // File doesn't exist yet — fall through and create it.
    }

    await fs.writeFile(OUTPUT_FILE, json, 'utf-8');
    console.log(`[tsconfig-paths] Regenerated tsconfig.paths.json (${modules.length} module alias(es)).`);
}

// Allow running standalone: `node generate-tsconfig-paths.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    generateTsconfigPaths().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
