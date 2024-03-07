import { IInstruction } from '@solana/instructions';

import { ITransactionWithBlockhashLifetime } from './blockhash';
import { IDurableNonceTransaction } from './durable-nonce';
import { ITransactionWithFeePayer } from './fee-payer';
import { BaseTransaction, TransactionVersion } from './types';

export type CompilableTransaction<
    TVersion extends TransactionVersion = TransactionVersion,
    TInstruction extends IInstruction = IInstruction,
> = BaseTransaction<TVersion, TInstruction> &
    ITransactionWithFeePayer &
    (IDurableNonceTransaction | ITransactionWithBlockhashLifetime);
