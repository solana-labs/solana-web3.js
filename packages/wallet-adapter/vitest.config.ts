import {fileURLToPath} from 'node:url';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

// @testing-library/react unmounts between tests only with a global `afterEach`, hence `globals`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@solana\/kit-plugin-wallet$/,
        replacement: fileURLToPath(
          new URL(
            './node_modules/@solana/kit-plugin-wallet/dist/index.browser.mjs',
            import.meta.url,
          ),
        ),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/__tests__/**/*-test.ts?(x)'],
  },
});
