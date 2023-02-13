import type { Config } from 'jest';
import path from 'path';

const config: Config = {
    projects: [
        path.resolve(__dirname, 'jest-lint.config.ts'),
        path.resolve(__dirname, 'jest-prettier.config.ts'),
        path.resolve(__dirname, 'jest-unit.config.browser.ts'),
        path.resolve(__dirname, 'jest-unit.config.node.ts'),
    ],
};

export default config;
