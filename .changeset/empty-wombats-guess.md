---
"@solana/addresses": patch
"@solana/assertions": patch
"@solana/codecs-core": patch
"@solana/codecs-data-structures": patch
"@solana/codecs-numbers": patch
"@solana/codecs-strings": patch
"@solana/compat": patch
"@solana/errors": patch
"@solana/keys": patch
"@solana/options": patch
"@solana/react": patch
"@solana/signers": patch
"@solana/subscribable": patch
"@solana/sysvars": patch
"@solana/transaction-confirmation": patch
"@solana/webcrypto-ed25519-polyfill": patch
---

A two-versions-old version of Node LTS is now specified everywhere via the `engines` field, including the one in the root of the `pnpm` workspace, and engine-strictness is delegated to the `.npmrc` files.
