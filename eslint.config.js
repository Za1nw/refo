
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import typescript from 'typescript-eslint';

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
    js.configs.recommended,
    reactHooks.configs.flat.recommended,
    ...typescript.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir,
            },
        },
    },
    {
        ...react.configs.flat.recommended,
        ...react.configs.flat['jsx-runtime'], // Required for React 17+
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        ...importPlugin.flatConfigs.recommended,
        settings: {
            'import/resolver': {
                typescript: true,
                node: true,
            },
        },
        rules: {
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    pathGroups: [
                        {
                            pattern: '@/**',
                            group: 'internal',
                        },
                         {
                            pattern: '@/modules/**',
                            group: 'internal',
                        },
                    ],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                },
            ],
        },
    },
    {
        ...importPlugin.flatConfigs.typescript,
        files: ['**/*.{ts,tsx}'],
    },
    {
        ignores: ['vendor/**', 'node_modules/**', 'public/**', 'bootstrap/ssr/**', 'tailwind.config.js'],
    },
    prettier, // Turn off all rules that might conflict with Prettier
];
