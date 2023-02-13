import path from 'path';
import { Format, Options } from 'tsup';

type Platform =
    | 'browser'
    | 'node'
    // React Native
    | 'native';

export function getBaseConfig(platform: Platform, format: Format[], options: Options): Options[] {
    return [true, false].map<Options>(isDebugBuild => ({
        clean: true,
        define: {
            __BROWSER__: `${platform === 'browser'}`,
            __NODEJS__: `${platform === 'node'}`,
            __REACTNATIVE__: `${platform === 'native'}`,
        },
        entry: [`./src/index.ts`],
        esbuildOptions(options, fuck) {
            const { format } = fuck;
            options.minify = format === 'iife' && !isDebugBuild;
            if (format === 'iife') {
                options.define = {
                    ...options.define,
                    __DEV__: `${isDebugBuild}`,
                };
            }
            options.inject = [path.resolve(__dirname, 'env-shim.ts')];
        },
        format,
        globalName: 'solanaWeb3',
        name: platform,
        onSuccess: options.watch ? 'tsc -p ./tsconfig.declarations.json' : undefined,
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
