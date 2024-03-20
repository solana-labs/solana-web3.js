import { Config } from '@jest/types';
import path from 'path';

const config: Partial<Config.InitialProjectOptions> = {
    moduleNameMapper: {
        // Strip `.js` from imports
        // https://github.com/swc-project/jest/issues/64#issuecomment-1029753225
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    resetMocks: true,
    restoreMocks: true,
    roots: ['<rootDir>/src/'],
    setupFilesAfterEnv: [
        path.resolve(__dirname, 'setup-dev-mode.ts'),
        path.resolve(__dirname, 'setup-define-version-constant.ts'),
        path.resolve(__dirname, 'setup-webcrypto.ts'),
    ],
    testPathIgnorePatterns: ['__setup__.ts'],
    transform: {
        '^.+\\.(ts|js)$': [
            '@swc/jest',
            {
                jsc: {
                    target: 'es2020',
                },
            },
        ],
    },
    transformIgnorePatterns: ['/node_modules/(?!.*\\@noble/ed25519/)', '\\.pnp\\.[^\\/]+$'],
};

export default config;
