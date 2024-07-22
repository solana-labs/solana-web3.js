import { Address } from '@solana/addresses';
import { SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM, SolanaError } from '@solana/errors';
import { createTransactionMessage, TransactionMessage } from '@solana/transaction-messages';

import { isProgramError } from '../program-error';

const tx = {} as TransactionMessage;
const programAddress = '1111' as Address;

{
    // [isProgramError]: It accepts a new TransactionMessage as a second argument.
    const transactionMessage = createTransactionMessage({ version: 0 });
    isProgramError(null, transactionMessage, programAddress);
}

{
    // [isProgramError]: It narrow down the error type.
    const error = {} as Error;
    if (isProgramError(error, tx, programAddress)) {
        error satisfies SolanaError<typeof SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM>;
    }
}

{
    // [isProgramError]: It narrow down the error type and its custom program error code.
    const error = {} as Error;
    if (isProgramError(error, tx, programAddress, 42)) {
        error satisfies SolanaError<typeof SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM> & {
            readonly context: { readonly code: 42 };
        };
        // @ts-expect-error Expected error to have code 42
        error satisfies SolanaError<typeof SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM> & {
            readonly context: { readonly code: 43 };
        };
    }
}
