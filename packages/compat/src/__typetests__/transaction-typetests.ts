import {
    ITransactionWithBlockhashLifetime,
    ITransactionWithFeePayer,
    ITransactionWithSignatures,
    Transaction,
} from '@solana/transactions';
import { VersionedTransaction } from '@solana/web3.js';

import { SignedVersionedTransaction } from '../signed-versioned-transaction';
import { fromOldVersionedTransactionWithBlockhash } from '../transaction';

{
    const transaction = null as unknown as VersionedTransaction;
    const returned = fromOldVersionedTransactionWithBlockhash(transaction, 0n);
    returned satisfies Transaction & ITransactionWithFeePayer & ITransactionWithBlockhashLifetime;
}

{
    const transaction = null as unknown as SignedVersionedTransaction;
    const returned = fromOldVersionedTransactionWithBlockhash(transaction, 0n);
    returned satisfies Transaction &
        ITransactionWithFeePayer &
        ITransactionWithBlockhashLifetime &
        ITransactionWithSignatures;
}
