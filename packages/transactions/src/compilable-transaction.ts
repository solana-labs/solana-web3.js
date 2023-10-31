import { ITransactionWithBlockhashLifetime } from './blockhash';
import { IDurableNonceTransaction } from './durable-nonce';
import { ITransactionWithFeePayer } from './fee-payer';
import { BaseTransaction } from './types';

export type CompilableTransaction = BaseTransaction &
    ITransactionWithFeePayer &
    (ITransactionWithBlockhashLifetime | IDurableNonceTransaction);
