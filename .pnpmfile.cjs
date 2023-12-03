function readPackage(pkg, context) {
    if (pkg.name === '@solana/web3.js' && pkg.version.startsWith('0.0.0-development')) {
        pkg.dependencies = {
            ...pkg.dependencies,
            /**
             * The legacy web3.js specifies the following in its package.json...
             *
             *     "@solana/keys": "workspace:@solana/keys-legacy@*"
             *
             * ...instead of this...
             *
             *     "@solana/keys": "workspace:../keys"
             *
             * ...to work around a bug in Turborepo: https://github.com/vercel/turbo/issues/6744
             *
             * That hack makes Turborepo form the correct dependency graph, but we still need `pnpm`
             * to source the correct package name at publish time. For that reason, we set the
             * dependency back to `workspace:../keys` here. This is visible to `pnpm` but invisible
             * to Turborepo, so both are happy.
             */
            '@solana/keys': 'workspace:../keys',
        };
        context.log(
            'Replacing `@solana/keys` with `workspace:../keys` in `packages/legacy/library/`. See `.pnpmfile.cjs` for more context.',
        );
    }
    return pkg;
}

module.exports = {
    hooks: {
        readPackage,
    },
};
