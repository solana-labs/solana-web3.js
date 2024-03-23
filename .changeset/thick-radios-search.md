---
"@solana/assertions": patch
"@solana/errors": patch
"@solana/keys": patch
---

`createKeyPairFromBytes()` now validates that the public key imported is the one that would be derived from the private key imported
