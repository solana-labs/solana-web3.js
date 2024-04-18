import { IInstruction } from '@solana/instructions';

import { TransactionMessageWithBlockhashLifetime } from './blockhash';
import { TransactionMessageWithDurableNonceLifetime } from './durable-nonce';
import { ITransactionMessageWithFeePayer } from './fee-payer';
import { BaseTransactionMessage, TransactionVersion } from './transaction-message';

export type CompilableTransactionMessage<
    TVersion extends TransactionVersion = TransactionVersion,
    TInstruction extends IInstruction = IInstruction,
> = BaseTransactionMessage<TVersion, TInstruction> &
    ITransactionMessageWithFeePayer &
    (TransactionMessageWithBlockhashLifetime | TransactionMessageWithDurableNonceLifetime);
