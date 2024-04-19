import { IInstruction } from '@solana/instructions';

import { TransactionMessageWithBlockhashLifetime } from './blockhash';
import { TransactionMessageWithDurableNonceLifetime } from './durable-nonce';
import { ITransactionMessageWithFeePayer } from './fee-payer';
import { BaseTransactionMessage, NewTransactionVersion } from './transaction-message';

export type CompilableTransactionMessage<
    TVersion extends NewTransactionVersion = NewTransactionVersion,
    TInstruction extends IInstruction = IInstruction,
> = BaseTransactionMessage<TVersion, TInstruction> &
    ITransactionMessageWithFeePayer &
    (TransactionMessageWithBlockhashLifetime | TransactionMessageWithDurableNonceLifetime);
