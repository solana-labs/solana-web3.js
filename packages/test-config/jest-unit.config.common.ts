import { Config } from '@jest/types';

const config: Partial<Config.InitialProjectOptions> = {
    globals: {
        __DEV__: false,
    },
    roots: ['<rootDir>/src/'],
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
