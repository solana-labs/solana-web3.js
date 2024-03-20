/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Keypair as LegacyKeypairWithPrivateKeypairProperty } from '@solana/web3.js-legacy';

import { Keypair } from '../key-pair.js';

type LegacyKeypair = Omit<LegacyKeypairWithPrivateKeypairProperty, '_keypair'>;

new Keypair() satisfies LegacyKeypair;
new Keypair({
    publicKey: new Uint8Array([]),
    secretKey: new Uint8Array([]),
}) satisfies LegacyKeypair;

// I want this to pass, but there's no way to match the `_keypair` properties
// in each of these classes, because the legacy one has `private` visibilty.
// @ts-expect-error
Keypair satisfies typeof LegacyKeypairWithPrivateKeypairProperty;
