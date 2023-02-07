import type { Config } from 'jest';

const config: Config = {
    displayName: 'Prettier',
    moduleFileExtensions: ['js', 'ts', 'json', 'md'],
    rootDir: '../../',
    runner: 'prettier',
    testMatch: ['<rootDir>README.md', '<rootDir>internal/**', '<rootDir>src/**', '<rootDir>*'],
};

export default config;
