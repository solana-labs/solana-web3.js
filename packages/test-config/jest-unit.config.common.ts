import { Config } from '@jest/types';
import path from 'path';

const config: Partial<Config.InitialProjectOptions> = {
    restoreMocks: true,
    roots: ['<rootDir>/src/'],
    setupFilesAfterEnv: [path.resolve(__dirname, 'setup-dev-mode.ts'), path.resolve(__dirname, 'setup-fetch-mock.ts')],
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
