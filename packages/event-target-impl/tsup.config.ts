import { defineConfig } from 'tsup';

export default defineConfig(_options =>
    (['browser', 'node'] as const).map(platform => ({
        entry: [`./src/index.${platform}.ts`],
        format: ['cjs', 'esm'],
        minify: true,
        name: platform,
        outExtension({ format }) {
            return { js: `.${format === 'cjs' ? 'cjs' : 'mjs'}` };
        },
        platform,
        sourcemap: true,
        treeshake: true,
    })),
);
