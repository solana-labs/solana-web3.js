import type { Config } from '@jest/types';

const config: Partial<Config.InitialProjectOptions> = {
    displayName: {
        color: 'magentaBright',
        name: 'Prettier',
    },
    moduleFileExtensions: ['js', 'ts', 'json', 'md'],
    runner: 'prettier',
    testMatch: ['<rootDir>/src/**', '<rootDir>*'],
    testPathIgnorePatterns: ['README.md', 'CHANGELOG.md'],
};

export default config;
