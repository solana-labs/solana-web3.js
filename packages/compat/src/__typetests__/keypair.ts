import { Keypair } from '@solana/web3.js';

import { fromLegacyKeypair } from '../keypair';

async () => {
    {
        const keypair = null as unknown as Keypair;
        (await fromLegacyKeypair(keypair)) satisfies CryptoKeyPair;
    }
};
