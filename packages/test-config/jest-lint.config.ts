import type { Config } from 'jest';

const config: Config = {
    displayName: 'ESLint',
    runner: 'eslint',
    testMatch: ['<rootDir>src/**/*.ts'],
};

export default config;
