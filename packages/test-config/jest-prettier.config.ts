import type { Config } from '@jest/types';

const config: Partial<Config.ProjectConfig> = {
    displayName: {
        color: 'magentaBright',
        name: 'Prettier',
    },
    moduleFileExtensions: ['js', 'ts', 'json', 'md'],
    runner: 'prettier',
    testMatch: ['<rootDir>/src/**', '<rootDir>*'],
};

export default config;
