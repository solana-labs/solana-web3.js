import type { Config } from 'jest';

const config: Config = {
    globals: {
        __DEV__: false,
    },
    rootDir: '../../',
    roots: ['<rootDir>src/'],
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
