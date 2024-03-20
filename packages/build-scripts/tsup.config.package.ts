import { defineConfig } from 'tsup';

import { getBaseConfig } from './getBaseConfig.js';

export default defineConfig(options => [
    ...getBaseConfig('node', ['cjs', 'esm'], options),
    ...getBaseConfig('browser', ['cjs', 'esm'], options),
    ...getBaseConfig('native', ['esm'], options),
]);
