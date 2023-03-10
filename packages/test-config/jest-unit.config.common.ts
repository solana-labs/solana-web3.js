import { Config } from '@jest/types';
import path from 'path';

const config: Partial<Config.InitialProjectOptions> = {
    globals: {
        __DEV__: false,
    },
    restoreMocks: true,
    roots: ['<rootDir>/src/'],
    setupFiles: [path.resolve(__dirname, 'setup-fetch-mock.ts')],
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
};

export default config;
