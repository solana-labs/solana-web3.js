---
'@solana/keys': patch
---

Add a `createKeyPairFromPrivateKeyBytes` helper that creates a keypair from the 32-byte private key bytes.

```ts
import { createKeyPairFromPrivateKeyBytes } from '@solana/keys';

const { privateKey, publicKey } = await createKeyPairFromPrivateKeyBytes(new Uint8Array([...]));
```
