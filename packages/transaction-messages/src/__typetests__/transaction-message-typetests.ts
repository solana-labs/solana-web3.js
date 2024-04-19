import { Address } from '@solana/addresses';
import { Blockhash } from '@solana/rpc-types';

import {
    assertIsTransactionMessageWithBlockhashLifetime,
    setTransactionMessageLifetimeUsingBlockhash,
    TransactionMessageWithBlockhashLifetime,
} from '../blockhash';
import { CompilableTransactionMessage } from '../compilable-transaction-message';
import { createTransactionMessage } from '../create-transaction-message';
import {
    Nonce,
    setTransactionMessageLifetimeUsingDurableNonce,
    TransactionMessageWithDurableNonceLifetime,
} from '../durable-nonce';
import { ITransactionMessageWithFeePayer, setTransactionMessageFeePayer } from '../fee-payer';
import { appendTransactionMessageInstruction, prependTransactionMessageInstruction } from '../instructions';
import { BaseTransactionMessage, TransactionMessage } from '../transaction-message';

const mockFeePayer = null as unknown as Address<'feePayer'>;
const mockBlockhash = null as unknown as Blockhash;
const mockBlockhashLifetime = {
    blockhash: mockBlockhash,
    lastValidBlockHeight: 0n,
};
const mockNonceConfig = {
    nonce: null as unknown as Nonce<'nonce'>,
    nonceAccountAddress: null as unknown as Address<'nonce'>,
    nonceAuthorityAddress: null as unknown as Address<'nonceAuthority'>,
};

const mockInstruction = {
    accounts: [],
    data: Uint8Array.of(0),
    programAddress: null as unknown as Address<'program'>,
} as TransactionMessage['instructions'][number];

// createTransactionMessage
createTransactionMessage({ version: 'legacy' }) satisfies Extract<TransactionMessage, { version: 'legacy' }>;
// @ts-expect-error version should match
createTransactionMessage({ version: 0 }) satisfies Extract<TransactionMessage, { version: 'legacy' }>;
createTransactionMessage({ version: 0 }) satisfies Extract<TransactionMessage, { version: 0 }>;
// @ts-expect-error version should match
createTransactionMessage({ version: 'legacy' }) satisfies Extract<TransactionMessage, { version: 0 }>;

// setTransactionMessageLifetimeUsingBlockhash
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }>,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & TransactionMessageWithBlockhashLifetime;
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }>,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 0 }> & TransactionMessageWithBlockhashLifetime;
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
) satisfies Extract<TransactionMessage, { version: 0 }> & TransactionMessageWithBlockhashLifetime;
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & TransactionMessageWithBlockhashLifetime;

{
    // assertIsTransactionMessageWithBlockhashLifetime
    const transaction = null as unknown as BaseTransactionMessage;
    // @ts-expect-error Should not be blockhash lifetime
    transaction satisfies TransactionMessageWithBlockhashLifetime;
    // @ts-expect-error Should not satisfy has blockhash
    transaction satisfies {
        lifetimeConstraint: {
            blockhash: Blockhash;
        };
    };
    // @ts-expect-error Should not satisfy has lastValidBlockHeight
    transaction satisfies {
        lifetimeConstraint: {
            lastValidBlockHeight: bigint;
        };
    };
    assertIsTransactionMessageWithBlockhashLifetime(transaction);
    transaction satisfies TransactionMessageWithBlockhashLifetime;
    transaction satisfies {
        lifetimeConstraint: {
            blockhash: Blockhash;
        };
    };
    transaction satisfies {
        lifetimeConstraint: {
            lastValidBlockHeight: bigint;
        };
    };
}

// setTransactionMessageLifetimeUsingDurableNonce
setTransactionMessageLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }>,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & TransactionMessageWithDurableNonceLifetime;
setTransactionMessageLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }>,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 0 }> & TransactionMessageWithDurableNonceLifetime;
setTransactionMessageLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
) satisfies Extract<TransactionMessage, { version: 0 }> & TransactionMessageWithDurableNonceLifetime;
setTransactionMessageLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & TransactionMessageWithDurableNonceLifetime;

// setTransactionMessageFeePayer

// (base)
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }>,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & ITransactionMessageWithFeePayer<'feePayer'>;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> &
        ITransactionMessageWithFeePayer<'NOTfeePayer'>,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & ITransactionMessageWithFeePayer<'feePayer'>;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }>,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 0 }> & ITransactionMessageWithFeePayer<'feePayer'>;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
) satisfies Extract<TransactionMessage, { version: 0 }> & ITransactionMessageWithFeePayer<'feePayer'>;

// (blockhash)
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> & TransactionMessageWithBlockhashLifetime,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> &
    ITransactionMessageWithFeePayer<'feePayer'> &
    TransactionMessageWithBlockhashLifetime;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> &
        ITransactionMessageWithFeePayer<'NOTfeePayer'> &
        TransactionMessageWithBlockhashLifetime,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> &
    ITransactionMessageWithFeePayer<'feePayer'> &
    TransactionMessageWithBlockhashLifetime;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> & TransactionMessageWithBlockhashLifetime,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 0 }> &
    ITransactionMessageWithFeePayer<'feePayer'> &
    TransactionMessageWithBlockhashLifetime;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 0 }> & TransactionMessageWithBlockhashLifetime,
) satisfies Extract<TransactionMessage, { version: 0 }> &
    ITransactionMessageWithFeePayer<'feePayer'> &
    TransactionMessageWithBlockhashLifetime;

// (durable nonce)
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> & TransactionMessageWithDurableNonceLifetime,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> &
    ITransactionMessageWithFeePayer<'feePayer'> &
    TransactionMessageWithDurableNonceLifetime;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> &
        ITransactionMessageWithFeePayer<'NOTfeePayer'> &
        TransactionMessageWithDurableNonceLifetime,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> &
    ITransactionMessageWithFeePayer<'feePayer'> &
    TransactionMessageWithDurableNonceLifetime;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> & TransactionMessageWithDurableNonceLifetime,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 0 }> &
    ITransactionMessageWithFeePayer<'feePayer'> &
    TransactionMessageWithDurableNonceLifetime;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 0 }> & TransactionMessageWithDurableNonceLifetime,
) satisfies Extract<TransactionMessage, { version: 0 }> &
    ITransactionMessageWithFeePayer<'feePayer'> &
    TransactionMessageWithDurableNonceLifetime;

// appendTransactionMessageInstruction
appendTransactionMessageInstruction(
    mockInstruction,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }>,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & {
    instructions: TransactionMessage['instructions'];
};
appendTransactionMessageInstruction(
    mockInstruction,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> & ITransactionMessageWithFeePayer<'feePayer'>,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> &
    ITransactionMessageWithFeePayer<'feePayer'> & {
        instructions: TransactionMessage['instructions'];
    };

// prependTransactionMessageInstruction
prependTransactionMessageInstruction(
    mockInstruction,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }>,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & {
    instructions: TransactionMessage['instructions'];
};
prependTransactionMessageInstruction(
    mockInstruction,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> & ITransactionMessageWithFeePayer<'feePayer'>,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> &
    ITransactionMessageWithFeePayer<'feePayer'> & {
        instructions: TransactionMessage['instructions'];
    };

// CompilableTransactionMessage
// @ts-expect-error missing fee payer + lifetime token
null as unknown as BaseTransactionMessage satisfies CompilableTransactionMessage;
// @ts-expect-error missing lifetime token
null as unknown as BaseTransactionMessage & ITransactionMessageWithFeePayer satisfies CompilableTransactionMessage;
null as unknown as BaseTransactionMessage &
    // @ts-expect-error missing fee payer
    TransactionMessageWithBlockhashLifetime satisfies CompilableTransactionMessage;
{
    const transaction = null as unknown as BaseTransactionMessage & TransactionMessageWithDurableNonceLifetime;
    // @ts-expect-error missing fee payer
    transaction satisfies CompilableTransactionMessage;
}
null as unknown as BaseTransactionMessage &
    ITransactionMessageWithFeePayer &
    TransactionMessageWithBlockhashLifetime satisfies CompilableTransactionMessage;
null as unknown as BaseTransactionMessage &
    ITransactionMessageWithFeePayer &
    TransactionMessageWithDurableNonceLifetime satisfies CompilableTransactionMessage;
