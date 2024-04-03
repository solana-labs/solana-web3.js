import { Address } from '@solana/addresses';
import { Blockhash } from '@solana/rpc-types';

import {
    assertIsTransactionMessageWithBlockhashLifetime,
    ITransactionMessageWithBlockhashLifetime,
    setTransactionMessageLifetimeUsingBlockhash,
} from '../blockhash';
import { createTransactionMessage } from '../create-transaction-message';
import {
    IDurableNonceTransactionMessage,
    NewNonce,
    setTransactionMessageLifetimeUsingDurableNonce,
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
    nonce: null as unknown as NewNonce<'nonce'>,
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
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & ITransactionMessageWithBlockhashLifetime;
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }>,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 0 }> & ITransactionMessageWithBlockhashLifetime;
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
) satisfies Extract<TransactionMessage, { version: 0 }> & ITransactionMessageWithBlockhashLifetime;
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & ITransactionMessageWithBlockhashLifetime;

{
    // assertIsTransactionMessageWithBlockhashLifetime
    const transaction = null as unknown as BaseTransactionMessage;
    // @ts-expect-error Should not be blockhash lifetime
    transaction satisfies ITransactionMessageWithBlockhashLifetime;
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
    transaction satisfies ITransactionMessageWithBlockhashLifetime;
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
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & IDurableNonceTransactionMessage;
setTransactionMessageLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }>,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 0 }> & IDurableNonceTransactionMessage;
setTransactionMessageLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
) satisfies Extract<TransactionMessage, { version: 0 }> & IDurableNonceTransactionMessage;
setTransactionMessageLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & IDurableNonceTransactionMessage;

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
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> & ITransactionMessageWithBlockhashLifetime,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> &
    ITransactionMessageWithBlockhashLifetime &
    ITransactionMessageWithFeePayer<'feePayer'>;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> &
        ITransactionMessageWithBlockhashLifetime &
        ITransactionMessageWithFeePayer<'NOTfeePayer'>,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> &
    ITransactionMessageWithBlockhashLifetime &
    ITransactionMessageWithFeePayer<'feePayer'>;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> & ITransactionMessageWithBlockhashLifetime,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 0 }> &
    ITransactionMessageWithBlockhashLifetime &
    ITransactionMessageWithFeePayer<'feePayer'>;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 0 }> & ITransactionMessageWithBlockhashLifetime,
) satisfies Extract<TransactionMessage, { version: 0 }> &
    ITransactionMessageWithBlockhashLifetime &
    ITransactionMessageWithFeePayer<'feePayer'>;

// (durable nonce)
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> & IDurableNonceTransactionMessage,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> &
    IDurableNonceTransactionMessage &
    ITransactionMessageWithFeePayer<'feePayer'>;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> &
        IDurableNonceTransactionMessage &
        ITransactionMessageWithFeePayer<'NOTfeePayer'>,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> &
    IDurableNonceTransactionMessage &
    ITransactionMessageWithFeePayer<'feePayer'>;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }> & IDurableNonceTransactionMessage,
    // @ts-expect-error Version should match
) satisfies Extract<TransactionMessage, { version: 0 }> &
    IDurableNonceTransactionMessage &
    ITransactionMessageWithFeePayer<'feePayer'>;
setTransactionMessageFeePayer(
    mockFeePayer,
    null as unknown as Extract<TransactionMessage, { version: 0 }> & IDurableNonceTransactionMessage,
) satisfies Extract<TransactionMessage, { version: 0 }> &
    IDurableNonceTransactionMessage &
    ITransactionMessageWithFeePayer<'feePayer'>;

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
