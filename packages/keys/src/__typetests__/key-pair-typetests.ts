/* eslint-disable @typescript-eslint/no-floating-promises */
import { ReadonlyUint8Array } from '@solana/codecs-core';

import { createKeyPairFromBytes, createKeyPairFromPrivateKeyBytes } from '../key-pair';

createKeyPairFromBytes(new Uint8Array()) satisfies Promise<CryptoKeyPair>;
createKeyPairFromBytes(new Uint8Array() as ReadonlyUint8Array) satisfies Promise<CryptoKeyPair>;
createKeyPairFromBytes(new Uint8Array(), true) satisfies Promise<CryptoKeyPair>;

createKeyPairFromPrivateKeyBytes(new Uint8Array()) satisfies Promise<CryptoKeyPair>;
createKeyPairFromPrivateKeyBytes(new Uint8Array() as ReadonlyUint8Array) satisfies Promise<CryptoKeyPair>;
createKeyPairFromPrivateKeyBytes(new Uint8Array(), true) satisfies Promise<CryptoKeyPair>;
