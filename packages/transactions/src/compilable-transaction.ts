import { IInstruction } from '@solana/instructions';

import { ITransactionWithBlockhashLifetime } from './blockhash.js';
import { IDurableNonceTransaction } from './durable-nonce.js';
import { ITransactionWithFeePayer } from './fee-payer.js';
import { BaseTransaction, TransactionVersion } from './types.js';

export type CompilableTransaction<
    TVersion extends TransactionVersion = TransactionVersion,
    TInstruction extends IInstruction = IInstruction,
> = BaseTransaction<TVersion, TInstruction> &
    ITransactionWithFeePayer &
    (IDurableNonceTransaction | ITransactionWithBlockhashLifetime);
