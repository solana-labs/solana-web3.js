/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PublicKey as LegacyPublicKey } from '@solana/web3.js-legacy';

import { PublicKey } from '../public-key.js';

new PublicKey('123') satisfies LegacyPublicKey;

PublicKey satisfies typeof LegacyPublicKey;
