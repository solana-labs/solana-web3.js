import type { Config } from 'jest';

const config: Config = {
    displayName: 'Prettier',
    moduleFileExtensions: ['js', 'ts', 'json', 'md'],
    runner: 'prettier',
    testMatch: ['<rootDir>/src/**', '<rootDir>*'],
};

export default config;
