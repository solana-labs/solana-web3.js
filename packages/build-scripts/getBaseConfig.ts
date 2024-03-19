import { env } from 'node:process';

import browsersListToEsBuild from 'browserslist-to-esbuild';
import path from 'path';
import { Format, Options } from 'tsup';

type Platform =
    | 'browser'
    // React Native
    | 'native'
    | 'node';

const BROWSERSLIST_TARGETS = browsersListToEsBuild();

export function getBaseConfig(platform: Platform, formats: Format[], _options: Options): Options[] {
    return [true, false]
        .flatMap<Options | null>(isDebugBuild =>
            formats.map(format =>
                format !== 'iife' && isDebugBuild
                    ? null // We don't build debug builds for packages; only for the iife bundle.
                    : {
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
                                  options.target = BROWSERSLIST_TARGETS;
                              }
                              options.inject = [path.resolve(__dirname, 'env-shim.ts')];
                          },
                          external: [
                              // Despite inlining `@solana/text-encoding-impl`, do not recursively inline `fastestsmallesttextencoderdecoder`.
                              'fastestsmallesttextencoderdecoder',
                              // Despite inlining `@solana/ws-impl`, do not recursively inline `ws`.
                              'ws',
                          ],
                          format,
                          globalName: 'globalThis.solanaWeb3',
                          name: platform,
                          // Inline private, non-published packages.
                          // WARNING: This inlines packages recursively. Make sure these don't have deep dep trees.
                          noExternal: [
                              // @noble/ed25519 is an ESM-only module, so we have to inline it in CJS builds.
                              ...(format === 'cjs' ? ['@noble/ed25519'] : []),
                              '@solana/crypto-impl',
                              '@solana/text-encoding-impl',
                              '@solana/ws-impl',
                          ],
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
                          sourcemap: format !== 'iife' || isDebugBuild,
                          treeshake: true,
                      },
            ),
        )
        .filter(Boolean) as Options[];
}
