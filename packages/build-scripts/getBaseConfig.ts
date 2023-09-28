import { env } from 'node:process';

import path from 'path';
import { Format, Options } from 'tsup';

type Platform =
    | 'browser'
    | 'node'
    // React Native
    | 'native';

export function getBaseConfig(platform: Platform, format: Format[], _options: Options): Options[] {
    return [true, false].map<Options>(isDebugBuild => ({
        define: {
            __BROWSER__: `${platform === 'browser'}`,
            __NODEJS__: `${platform === 'node'}`,
            __REACTNATIVE__: `${platform === 'native'}`,
            __VERSION__: `"${env.npm_package_version}"`,
        },
        entry: [`./src/index.ts`],
        esbuildOptions(options, context) {
            const { format } = context;
            options.minify = format === 'iife' && !isDebugBuild;
            if (format === 'iife') {
                options.define = {
                    ...options.define,
                    __DEV__: `${isDebugBuild}`,
                };
            }
            options.inject = [path.resolve(__dirname, 'env-shim.ts')];
        },
        external: [
            // Despite inlining `text-encoding-impl`, do not recursively inline `fastestsmallesttextencoderdecoder`.
            'fastestsmallesttextencoderdecoder',
            // Despite inlining `fetch-impl`, do not recursively inline `node-fetch`.
            'node-fetch',
            // Despite inlining `ws-impl`, do not recursively inline `ws`.
            'ws',
        ],
        format,
        globalName: 'globalThis.solanaWeb3',
        name: platform,
        // Inline private, non-published packages.
        // WARNING: This inlines packages recursively. Make sure these don't have deep dep trees.
        noExternal: ['fetch-impl', 'text-encoding-impl', 'ws-impl'],
        outExtension({ format }) {
            let extension;
            if (format === 'iife') {
                extension = `.${isDebugBuild ? 'development' : 'production.min'}.js`;
            } else {
                extension = `.${platform}.${format === 'cjs' ? 'cjs' : 'js'}`;
            }
            return {
                js: extension,
            };
        },
        platform: platform === 'node' ? 'node' : 'browser',
        pure: ['process'],
        sourcemap: isDebugBuild,
        treeshake: true,
    }));
}
