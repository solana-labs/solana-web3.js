import type { Config } from '@jest/types';
import commonConfig from './jest-unit.config.common';

const config: Partial<Config.ProjectConfig> = {
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
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {},
};

export default config;
