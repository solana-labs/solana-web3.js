import { defineConfig } from 'tsup';

export default defineConfig(_options =>
    (['browser', 'node'] as const).map(platform => ({
        entry: [`./src/**`],
        format: ['cjs', 'esm'],
        minify: true,
        name: platform,
        platform,
        sourcemap: true,
        treeshake: true,
    }))
);
