import { ReadonlyUint8Array } from '@solana/codecs-core';

import { createKeyPairFromBytes } from '../key-pair';

createKeyPairFromBytes(new Uint8Array()) satisfies Promise<CryptoKeyPair>;
createKeyPairFromBytes(new Uint8Array() as ReadonlyUint8Array) satisfies Promise<CryptoKeyPair>;
