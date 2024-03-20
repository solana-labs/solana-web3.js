/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Transaction as LegacyTransaction } from '@solana/web3.js-legacy';

import { Transaction } from '../transaction.js';

new Transaction().signature satisfies Buffer | null;

new Transaction() satisfies LegacyTransaction;

Transaction satisfies typeof LegacyTransaction;
