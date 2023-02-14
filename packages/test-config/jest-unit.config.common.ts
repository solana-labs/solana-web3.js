import { Config } from '@jest/types';

const config: Partial<Config.ProjectConfig> = {
    globals: {
        __DEV__: false,
    },
    roots: ['<rootDir>/src/'],
    transform: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error See https://github.com/facebook/jest/issues/13913
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
