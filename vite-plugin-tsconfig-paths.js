import path from 'path';
import { fileURLToPath } from 'url';

import { generateTsconfigPaths } from './generate-tsconfig-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite plugin that keeps tsconfig.paths.json synchronized with the
 * currently enabled Laravel modules — purely by re-scanning the
 * filesystem, no stub or vendor dependency:
 *
 *  - Regenerates it once when Vite starts (build or dev).
 *  - During `vite dev`, watches modules_statuses.json (module
 *    enabled/disabled) and regenerates + triggers a full reload.
 *
 * @param {string} [root] - project root (defaults to this file's directory)
 */
export function tsconfigPathsSync(root = __dirname) {
    return {
        name: 'tsconfig-paths-sync',

        async buildStart() {
            await generateTsconfigPaths(root);
        },

        configureServer(server) {
            const statusesPath = path.join(root, 'modules_statuses.json');
            server.watcher.add(statusesPath);

            server.watcher.on('change', async (changedFile) => {
                if (changedFile !== statusesPath) {
                    return;
                }

                await generateTsconfigPaths(root);
                server.ws.send({ type: 'full-reload' });
            });
        },
    };
}
