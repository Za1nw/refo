import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';

import { getEnabledModulesWithAdminAssets } from './module-discovery.js';
import { tsconfigPathsSync } from './vite-plugin-tsconfig-paths.js';

/**
 * Build Vite resolve aliases for every enabled module's admin assets dir,
 * e.g. Account -> "@account" -> Modules/Account/resources/assets/admin.
 * Uses the same shared discovery that generates tsconfig.paths.json —
 * pure filesystem scan, no stub or vendor dependency.
 */
async function enabledModuleAdminAliases(root: string) {
    const modules = await getEnabledModulesWithAdminAssets(root);

    return modules.map(({ name, adminDir }) => ({
        find: `@${name.toLowerCase()}`,
        replacement: adminDir,
    }));
}

// Vite supports an async config factory, which lets us await the shared
// module-discovery pass before building aliases.
export default defineConfig(async () => {
    const root = fileURLToPath(new URL('.', import.meta.url));

    return {
        resolve: {
            alias: [
                ...(await enabledModuleAdminAliases(root)),
                {
                    find: '@',
                    replacement: resolve(root, 'resources/admin'),
                },
            ],
        },
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/admin/app.tsx'],
                ssr: 'resources/admin/ssr.tsx',
                refresh: true,
                fonts: [
                    bunny('Instrument Sans', {
                        weights: [400, 500, 600],
                    }),
                ],
            }),
            inertia(),
            react(),
            babel({ presets: [reactCompilerPreset()] }),
            tailwindcss(),
            wayfinder({
                formVariants: true,
                path: 'resources/admin/',
            }),
            // Regenerates tsconfig.paths.json on start and whenever a module
            // is enabled/disabled, keeping TypeScript in sync with Vite.
            tsconfigPathsSync(root),
        ],
        build: {
            rollupOptions: {
                output: {
                    manualChunks(id: string) {
                        const normalizedId = id.replaceAll('\\\\', '/');

                        if (normalizedId.includes('/node_modules/')) {
                            if (
                                normalizedId.includes('/@tiptap/pm/') ||
                                normalizedId.includes('/prosemirror-')
                            ) {
                                return 'vendor-prosemirror';
                            }

                            if (normalizedId.includes('/@tiptap/')) {
                                return 'vendor-tiptap';
                            }

                            if (normalizedId.includes('/@ui/button')) {
                                return 'vendor-tiptap';
                            }
                        }

                        return undefined;
                    },
                },
            },
        },
        server: {
            watch: {
                ignored: ['**/report_worker/**', '**/storage/**', '**/vendor/**'],
            },
        },
    };
});
