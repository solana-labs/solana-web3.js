import type { Config } from 'jest';

const config: Config = {
    projects: [
        '<rootDir>/internal/jest/jest-lint.config.ts',
        '<rootDir>/internal/jest/jest-prettier.config.ts',
        '<rootDir>/internal/jest/jest-unit.config.browser.ts',
        '<rootDir>/internal/jest/jest-unit.config.node.ts',
    ],
    rootDir: '../../',
};

export default config;
