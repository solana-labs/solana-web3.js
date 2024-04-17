import { IInstruction } from '@solana/instructions';

import { ITransactionMessageWithBlockhashLifetime } from './blockhash';
import { IDurableNonceTransactionMessage } from './durable-nonce';
import { ITransactionMessageWithFeePayer } from './fee-payer';
import { BaseTransactionMessage, NewTransactionVersion } from './transaction-message';

export type CompilableTransactionMessage<
    TVersion extends NewTransactionVersion = NewTransactionVersion,
    TInstruction extends IInstruction = IInstruction,
> = BaseTransactionMessage<TVersion, TInstruction> &
    ITransactionMessageWithFeePayer &
    (IDurableNonceTransactionMessage | ITransactionMessageWithBlockhashLifetime);
