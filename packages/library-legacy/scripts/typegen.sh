set -e

# Generate typescript declarations
pnpm tsc -p tsconfig.d.json -d

# Flatten typescript declarations
pnpm rollup -c rollup.config.types.mjs

# Replace export with closing brace for module declaration
sed -i.bak '$s/export {.*};/}/' lib/index.d.ts

# Replace declare's with export's
sed -i.bak 's/declare/export/g' lib/index.d.ts

# Prepend declare module line
sed -i.bak '2s;^;declare module "@solana/web3.js" {\n;' lib/index.d.ts

# Remove backup file from `sed` above
rm lib/index.d.ts.bak

# Run prettier
pnpm prettier --write lib/index.d.ts

# Check result
pnpm tsc --types ./test/__shadow-jest-types.d.ts lib/index.d.ts
