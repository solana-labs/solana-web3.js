import type { Config } from 'jest';

const config: Config = {
    displayName: 'ESLint',
    rootDir: '../../',
    runner: 'eslint',
    testMatch: ['<rootDir>src/**/*.ts', '<rootDir>internal/**'],
};

export default config;
