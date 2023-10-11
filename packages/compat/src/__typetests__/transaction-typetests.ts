import { ITransactionWithBlockhashLifetime, ITransactionWithFeePayer, Transaction } from '@solana/transactions';
import { VersionedTransaction } from '@solana/web3.js';

import { fromVersionedTransactionWithBlockhash } from '../transaction';

const transaction = null as unknown as VersionedTransaction;
const returned = fromVersionedTransactionWithBlockhash(transaction);
returned satisfies Transaction & ITransactionWithFeePayer & ITransactionWithBlockhashLifetime;
