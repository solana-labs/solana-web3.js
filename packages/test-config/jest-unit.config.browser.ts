import type { Config } from '@jest/types';
import path from 'path';

import commonConfig from './jest-unit.config.common';

const config: Partial<Config.InitialProjectOptions> = {
    ...commonConfig,
    displayName: {
        color: 'grey',
        name: 'Unit Test (Browser)',
    },
    globals: {
        ...commonConfig.globals,
        __BROWSER__: true,
        __NODEJS__: false,
        __REACTNATIVE__: false,
    },
    // From https://stackoverflow.com/a/73203803/1375972
    // this is required for @solana/compat, which uses the legacy web3js
    moduleNameMapper: {
        // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
        "uuid": require.resolve('uuid'),
    },
    setupFilesAfterEnv: [
        ...(commonConfig.setupFilesAfterEnv ?? []),
        path.resolve(__dirname, 'setup-secure-context.ts'),
        path.resolve(__dirname, 'setup-text-encoder.ts'),
        path.resolve(__dirname, 'setup-web-buffer-global.ts'),
        path.resolve(__dirname, 'setup-whatwg-fetch.ts'),
    ],
    testEnvironment: path.resolve(__dirname, 'browser-environment.ts'),
    testEnvironmentOptions: {},
    testPathIgnorePatterns: [...(commonConfig.testPathIgnorePatterns ?? []), '-test.node.ts$'],
};

export default config;
