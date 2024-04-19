import { Transaction } from '@solana/transactions';
import { VersionedTransaction } from '@solana/web3.js';

import { fromVersionedTransaction } from '../transaction';

const transaction = null as unknown as VersionedTransaction;
fromVersionedTransaction(transaction) satisfies Transaction;
