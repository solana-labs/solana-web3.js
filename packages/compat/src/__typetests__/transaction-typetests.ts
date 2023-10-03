import {
    Blockhash,
    ITransactionWithBlockhashLifetime,
    ITransactionWithFeePayer,
    ITransactionWithSignatures,
    Transaction,
} from '@solana/transactions';
import { VersionedTransaction } from '@solana/web3.js';

import { SignedVersionedTransaction } from '../signed-versioned-transaction';
import { fromVersionedTransactionWithBlockhash } from '../transaction';

const blockhash = 'HPtfw7WokBtLgMQ8R6Ke5Mh5Ev68j78Scg3xMi8saLS2' as Blockhash;

{
    const transaction = null as unknown as VersionedTransaction;
    const returned = fromVersionedTransactionWithBlockhash(transaction, blockhash, 0n);
    returned satisfies Transaction & ITransactionWithFeePayer & ITransactionWithBlockhashLifetime;
}

{
    const transaction = null as unknown as SignedVersionedTransaction;
    const returned = fromVersionedTransactionWithBlockhash(transaction, blockhash, 0n);
    returned satisfies Transaction &
        ITransactionWithFeePayer &
        ITransactionWithBlockhashLifetime &
        ITransactionWithSignatures;
}
