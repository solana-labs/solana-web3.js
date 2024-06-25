set -e

# Generate typescript declarations
pnpm tsc -p tsconfig.d.json -d

# Flatten typescript declarations
pnpm rollup -c rollup.config.types.mjs

# Run prettier
pnpm prettier --write lib/index.d.ts
