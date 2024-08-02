---
'@solana/keys': patch
---

Add a `getPublicKeyFromPrivateKey` helper that, given an extractable `CryptoKey` private key, gets the corresponding public key as a `CryptoKey`.

```ts
import { createPrivateKeyFromBytes, getPublicKeyFromPrivateKey } from '@solana/keys';

const privateKey = await createPrivateKeyFromBytes(new Uint8Array([...]), true);

const publicKey = await getPublicKeyFromPrivateKey(privateKey);
const extractablePublicKey = await getPublicKeyFromPrivateKey(privateKey, true);
```
