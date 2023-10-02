import { VersionedTransaction } from '@solana/web3.js';

import {
    assertIsSignedVersionedTransaction,
    isSignedVersionedTransaction,
    SignedVersionedTransaction,
    signedVersionedTransaction,
} from '../signed-versioned-transaction';

const transaction = null as unknown as VersionedTransaction;

isSignedVersionedTransaction(transaction) satisfies boolean;

assertIsSignedVersionedTransaction(transaction);
transaction satisfies SignedVersionedTransaction;

signedVersionedTransaction(transaction) satisfies SignedVersionedTransaction;
