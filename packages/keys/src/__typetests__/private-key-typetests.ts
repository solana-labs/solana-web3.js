/* eslint-disable @typescript-eslint/no-floating-promises */
import { ReadonlyUint8Array } from '@solana/codecs-core';

import { createPrivateKeyFromBytes } from '../private-key';

createPrivateKeyFromBytes(new Uint8Array()) satisfies Promise<CryptoKey>;
createPrivateKeyFromBytes(new Uint8Array() as ReadonlyUint8Array) satisfies Promise<CryptoKey>;
