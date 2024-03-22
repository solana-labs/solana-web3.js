import { defineConfig } from 'tsup';

export default defineConfig(_options =>
    (['browser', 'node', 'native'] as const).map(platform => ({
        entry: [`./src/index.${platform}.ts`],
        format: platform === 'native' ? ['esm'] : ['cjs', 'esm'],
        minify: true,
        name: platform,
        platform: platform === 'node' ? 'node' : 'browser',
        sourcemap: true,
        treeshake: true,
    })),
);
