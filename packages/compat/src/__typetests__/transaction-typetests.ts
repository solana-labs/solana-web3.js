import {
    IDurableNonceTransaction,
    ITransactionWithBlockhashLifetime,
    ITransactionWithFeePayer,
    Transaction,
} from '@solana/transactions';
import { VersionedTransaction } from '@solana/web3.js';

import { fromVersionedTransactionWithBlockhash, fromVersionedTransactionWithDurableNonce } from '../transaction';

// Blockhash
{
    const transaction = null as unknown as VersionedTransaction;
    const returned = fromVersionedTransactionWithBlockhash(transaction);
    returned satisfies ITransactionWithBlockhashLifetime & ITransactionWithFeePayer & Transaction;
}

// Durable nonce
{
    const transaction = null as unknown as VersionedTransaction;
    const returned = fromVersionedTransactionWithDurableNonce(transaction);
    returned satisfies IDurableNonceTransaction & ITransactionWithFeePayer & Transaction;
}
