import {
    ITransactionWithBlockhashLifetime,
    ITransactionWithFeePayer,
    ITransactionWithSignatures,
    Transaction,
} from '@solana/transactions';
import { VersionedTransaction } from '@solana/web3.js';

import { fromOldVersionedTransactionWithBlockhash } from '../transaction';

const transaction = null as unknown as VersionedTransaction;
const returned = fromOldVersionedTransactionWithBlockhash(transaction, 0n);
returned satisfies Transaction & ITransactionWithFeePayer & ITransactionWithBlockhashLifetime;

if ('signatures' in returned) {
    returned satisfies ITransactionWithSignatures;
}
