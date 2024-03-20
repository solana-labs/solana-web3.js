import { defineConfig } from 'tsup';

import { getBaseConfig } from './getBaseConfig.js';

export default defineConfig(options => [...getBaseConfig('browser', ['cjs', 'esm'], options)]);
