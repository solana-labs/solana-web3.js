import { defineConfig } from 'tsup';

import { getBaseConfig } from './getBaseConfig';

export default defineConfig(options => [...getBaseConfig('browser', ['cjs', 'esm'], options)]);
