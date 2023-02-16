import type { Config } from '@jest/types';

const config: Partial<Config.InitialProjectOptions> = {
    displayName: {
        color: 'cyanBright',
        name: 'ESLint',
    },
    runner: 'eslint',
    testMatch: ['<rootDir>src/**/*.ts'],
};

export default config;
