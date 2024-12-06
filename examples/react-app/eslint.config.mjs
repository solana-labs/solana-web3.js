import solanaReactConfig from '@solana/eslint-config-solana/react';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import globals from 'globals';

import baseConfig from '../../eslint.config.mjs';

export default [
    {
        ignores: ['**/dist', '**/*.css'],
    },
    ...baseConfig,
    ...solanaReactConfig,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2020,
            },
            parserOptions: {
                project: './tsconfig.app.json',
            },
        },
        plugins: {
            'react-refresh': reactRefreshPlugin,
        },
        rules: {
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/restrict-template-expressions': 'error',
            'react-refresh/only-export-components': [
                'warn',
                {
                    allowConstantExport: true,
                },
            ],
        },
    },
];
