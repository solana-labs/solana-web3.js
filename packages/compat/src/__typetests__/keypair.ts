/* eslint-disable @typescript-eslint/no-floating-promises */
import { Keypair } from '@solana/web3.js';

import { fromLegacyKeypair } from '../keypair';

{
    const keypair = null as unknown as Keypair;
    fromLegacyKeypair(keypair) satisfies Promise<CryptoKeyPair>;
}
