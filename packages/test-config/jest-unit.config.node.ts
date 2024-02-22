import path from 'node:path';

import { Config } from '@jest/types';

import commonConfig from './jest-unit.config.common';

const config: Partial<Config.InitialProjectOptions> = {
    ...commonConfig,
    displayName: {
        color: 'grey',
        name: 'Unit Test (Node)',
    },
    globals: {
        ...commonConfig.globals,
        __BROWSER__: false,
        __NODEJS__: true,
        __REACTNATIVE__: false,
    },
    setupFilesAfterEnv: [...(commonConfig.setupFilesAfterEnv ?? []), path.resolve(__dirname, 'setup-undici-fetch.ts')],
    testPathIgnorePatterns: [...(commonConfig.testPathIgnorePatterns ?? []), '-test.browser.ts$'],
};

export default config;
