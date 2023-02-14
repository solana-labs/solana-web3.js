import type { Config } from 'jest';

const config: NonNullable<Config['projects']>[number] = {
    displayName: 'Prettier',
    moduleFileExtensions: ['js', 'ts', 'json', 'md'],
    runner: 'prettier',
    testMatch: ['<rootDir>/src/**', '<rootDir>*'],
};

export default config;
