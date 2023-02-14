import type { Config } from 'jest';

const config: NonNullable<Config['projects']>[number] = {
    displayName: 'ESLint',
    runner: 'eslint',
    testMatch: ['<rootDir>src/**/*.ts'],
};

export default config;
