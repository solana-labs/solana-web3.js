import { defineConfig } from 'tsup';

import { getBaseConfig } from './getBaseConfig';
import packageConfigOrConfigsOrPromiseGetterForSame from './tsup.config.package';

export default defineConfig(async options => {
    const packageConfigOptionOrOptions =
        typeof packageConfigOrConfigsOrPromiseGetterForSame === 'function'
            ? await packageConfigOrConfigsOrPromiseGetterForSame(options)
            : packageConfigOrConfigsOrPromiseGetterForSame;
    const packageConfigOptions = Array.isArray(packageConfigOptionOrOptions)
        ? packageConfigOptionOrOptions
        : [packageConfigOptionOrOptions];
    return [...packageConfigOptions, ...getBaseConfig('browser', ['iife'], options)];
});
