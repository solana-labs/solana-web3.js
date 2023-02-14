import type { Config } from 'jest';
import commonConfig from './jest-unit.config.common';

const config: NonNullable<Config['projects']>[number] = {
    ...commonConfig,
    displayName: 'Unit Test (Browser)',
    globals: {
        ...commonConfig.globals,
        __BROWSER__: true,
        __NODEJS__: false,
        __REACTNATIVE__: false,
    },
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {},
};

export default config;
