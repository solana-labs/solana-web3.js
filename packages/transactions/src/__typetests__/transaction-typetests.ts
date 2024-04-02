import { Address } from '@solana/addresses';
import type { Blockhash } from '@solana/rpc-types';

import {
    appendTransactionInstruction,
    assertIsTransactionWithBlockhashLifetime,
    assertTransactionIsFullySigned,
    IDurableNonceTransaction,
    IFullySignedTransaction,
    ITransactionWithBlockhashLifetime,
    ITransactionWithSignatures,
    Nonce,
    partiallySignTransaction,
    prependTransactionInstruction,
    setTransactionLifetimeUsingBlockhash,
    setTransactionLifetimeUsingDurableNonce,
    signTransaction,
} from '..';
import { createTransaction } from '../create-transaction';
import { ITransactionWithFeePayer, setTransactionFeePayer } from '../fee-payer';
import { CompiledMessage, compileTransactionMessage } from '../message';
import { BaseTransaction, Transaction } from '../types';
import { getUnsignedTransaction } from '../unsigned-transaction';

const mockFeePayer = null as unknown as Address<'feePayer'>;
const mockBlockhash = null as unknown as Blockhash;
const mockBlockhashLifetime = {
    blockhash: mockBlockhash,
    lastValidBlockHeight: 0n,
};
const mockSigner = {} as CryptoKeyPair;
const mockNonceConfig = {
    nonce: null as unknown as Nonce<'nonce'>,
    nonceAccountAddress: null as unknown as Address<'nonce'>,
    nonceAuthorityAddress: null as unknown as Address<'nonceAuthority'>,
};
const mockInstruction = {
    accounts: [],
    data: Uint8Array.of(0),
    programAddress: null as unknown as Address<'program'>,
} as Transaction['instructions'][number];

// createTransaction
createTransaction({ version: 'legacy' }) satisfies Extract<Transaction, { version: 'legacy' }>;
// @ts-expect-error version should match
createTransaction({ version: 0 }) satisfies Extract<Transaction, { version: 'legacy' }>;
createTransaction({ version: 0 }) satisfies Extract<Transaction, { version: 0 }>;
// @ts-expect-error version should match
createTransaction({ version: 'legacy' }) satisfies Extract<Transaction, { version: 0 }>;

// setTransactionLifetimeUsingBlockhash
setTransactionLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<Transaction, { version: 'legacy' }>,
) satisfies Extract<Transaction, { version: 'legacy' }> & ITransactionWithBlockhashLifetime;
setTransactionLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<Transaction, { version: 'legacy' }>,
    // @ts-expect-error Version should match
) satisfies Extract<Transaction, { version: 0 }> & ITransactionWithBlockhashLifetime;
setTransactionLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithBlockhashLifetime &
    ITransactionWithSignatures;
setTransactionLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<Transaction, { version: 0 }>,
) satisfies Extract<Transaction, { version: 0 }> & ITransactionWithBlockhashLifetime;
setTransactionLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<Transaction, { version: 0 }>,
    // @ts-expect-error Version should match
) satisfies Extract<Transaction, { version: 'legacy' }> & ITransactionWithBlockhashLifetime;
setTransactionLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<Transaction, { version: 0 }> & ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 0 }> & ITransactionWithBlockhashLifetime & ITransactionWithSignatures;

// setTransactionLifetimeUsingDurableNonce
setTransactionLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<Transaction, { version: 'legacy' }>,
) satisfies Extract<Transaction, { version: 'legacy' }> & IDurableNonceTransaction;
setTransactionLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<Transaction, { version: 'legacy' }>,
    // @ts-expect-error Version should match
) satisfies Extract<Transaction, { version: 0 }> & IDurableNonceTransaction;
setTransactionLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 'legacy' }> & IDurableNonceTransaction & ITransactionWithSignatures;
setTransactionLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<Transaction, { version: 0 }>,
) satisfies Extract<Transaction, { version: 0 }> & IDurableNonceTransaction;
setTransactionLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<Transaction, { version: 0 }>,
    // @ts-expect-error Version should match
) satisfies Extract<Transaction, { version: 'legacy' }> & IDurableNonceTransaction;
setTransactionLifetimeUsingDurableNonce(
    mockNonceConfig,
    null as unknown as Extract<Transaction, { version: 0 }> & ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 0 }> & IDurableNonceTransaction & ITransactionWithSignatures;

// setTransactionFeePayer

// (base)
setTransactionFeePayer(mockFeePayer, null as unknown as Extract<Transaction, { version: 'legacy' }>) satisfies Extract<
    Transaction,
    { version: 'legacy' }
> &
    ITransactionWithFeePayer<'feePayer'>;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithFeePayer<'NOTfeePayer'>,
) satisfies Extract<Transaction, { version: 'legacy' }> & ITransactionWithFeePayer<'feePayer'>;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 'legacy' }>,
    // @ts-expect-error Version should match
) satisfies Extract<Transaction, { version: 0 }> & ITransactionWithFeePayer<'feePayer'>;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithFeePayer<'feePayer'> &
    ITransactionWithSignatures;
setTransactionFeePayer(mockFeePayer, null as unknown as Extract<Transaction, { version: 0 }>) satisfies Extract<
    Transaction,
    { version: 0 }
> &
    ITransactionWithFeePayer<'feePayer'>;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 0 }> & ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 0 }> & ITransactionWithFeePayer<'feePayer'> & ITransactionWithSignatures;

// (blockhash)
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithBlockhashLifetime,
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithBlockhashLifetime &
    ITransactionWithFeePayer<'feePayer'>;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'NOTfeePayer'>,
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithBlockhashLifetime &
    ITransactionWithFeePayer<'feePayer'>;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithBlockhashLifetime,
    // @ts-expect-error Version should match
) satisfies Extract<Transaction, { version: 0 }> &
    ITransactionWithBlockhashLifetime &
    ITransactionWithFeePayer<'feePayer'>;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithBlockhashLifetime &
    ITransactionWithFeePayer<'feePayer'> &
    ITransactionWithSignatures;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 0 }> & ITransactionWithBlockhashLifetime,
) satisfies Extract<Transaction, { version: 0 }> &
    ITransactionWithBlockhashLifetime &
    ITransactionWithFeePayer<'feePayer'>;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 0 }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 0 }> &
    ITransactionWithBlockhashLifetime &
    ITransactionWithFeePayer<'feePayer'> &
    ITransactionWithSignatures;

// (durable nonce)
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 'legacy' }> & IDurableNonceTransaction,
) satisfies Extract<Transaction, { version: 'legacy' }> &
    IDurableNonceTransaction &
    ITransactionWithFeePayer<'feePayer'>;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        IDurableNonceTransaction &
        ITransactionWithFeePayer<'NOTfeePayer'>,
) satisfies Extract<Transaction, { version: 'legacy' }> &
    IDurableNonceTransaction &
    ITransactionWithFeePayer<'feePayer'>;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 'legacy' }> & IDurableNonceTransaction,
    // @ts-expect-error Version should match
) satisfies Extract<Transaction, { version: 0 }> & IDurableNonceTransaction & ITransactionWithFeePayer<'feePayer'>;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        IDurableNonceTransaction &
        ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 'legacy' }> &
    IDurableNonceTransaction &
    ITransactionWithFeePayer<'feePayer'> &
    ITransactionWithSignatures;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 0 }> & IDurableNonceTransaction,
) satisfies Extract<Transaction, { version: 0 }> & IDurableNonceTransaction & ITransactionWithFeePayer<'feePayer'>;
setTransactionFeePayer(
    mockFeePayer,
    null as unknown as Extract<Transaction, { version: 0 }> & IDurableNonceTransaction & ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 0 }> &
    IDurableNonceTransaction &
    ITransactionWithFeePayer<'feePayer'> &
    ITransactionWithSignatures;

// partiallySignTransaction
// (blockhash)
partiallySignTransaction(
    [mockSigner],
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>,
) satisfies Promise<
    Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures
>;
partiallySignTransaction(
    [mockSigner],
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>,
    // @ts-expect-error Version should match
) satisfies Promise<
    Extract<Transaction, { version: 0 }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures
>;
partiallySignTransaction(
    [mockSigner],
    null as unknown as Extract<Transaction, { version: 0 }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>,
) satisfies Promise<
    Extract<Transaction, { version: 0 }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures
>;
partiallySignTransaction(
    [mockSigner],
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
) satisfies Promise<
    Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures
>;
partiallySignTransaction(
    [mockSigner],
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
    // @ts-expect-error Version should match
) satisfies Promise<
    Extract<Transaction, { version: 0 }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures
>;
partiallySignTransaction(
    [mockSigner],
    null as unknown as Extract<Transaction, { version: 0 }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
) satisfies Promise<
    Extract<Transaction, { version: 0 }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures
>;

// signTransaction
// (checks)
signTransaction(
    [mockSigner],
    // @ts-expect-error Type error on missing fee payer and lifetime
    null as unknown as Extract<Transaction, { version: 'legacy' }>,
);
signTransaction(
    [mockSigner],
    // @ts-expect-error Type error on missing lifetime
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithFeePayer<'feePayer'>,
);
signTransaction(
    [mockSigner],
    // @ts-expect-error Type error on missing fee payer (blockhash)
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithBlockhashLifetime,
);
signTransaction(
    [mockSigner],
    // @ts-expect-error Type error on missing fee payer (durable nonce)
    null as unknown as Extract<Transaction, { version: 'legacy' }> & IDurableNonceTransaction,
);

// (blockhash)
signTransaction(
    [mockSigner],
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>,
) satisfies Promise<
    Extract<Transaction, { version: 'legacy' }> &
        IFullySignedTransaction &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>
>;
signTransaction(
    [mockSigner],
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>,
    // @ts-expect-error Version should match
) satisfies Promise<
    Extract<Transaction, { version: 0 }> &
        IFullySignedTransaction &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>
>;
signTransaction(
    [mockSigner],
    null as unknown as Extract<Transaction, { version: 0 }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>,
) satisfies Promise<
    Extract<Transaction, { version: 0 }> &
        IFullySignedTransaction &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>
>;
signTransaction(
    [mockSigner],
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
) satisfies Promise<
    Extract<Transaction, { version: 'legacy' }> &
        IFullySignedTransaction &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>
>;
signTransaction(
    [mockSigner],
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
    // @ts-expect-error Version should match
) satisfies Promise<
    Extract<Transaction, { version: 0 }> &
        IFullySignedTransaction &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>
>;
signTransaction(
    [mockSigner],
    null as unknown as Extract<Transaction, { version: 0 }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
) satisfies Promise<
    Extract<Transaction, { version: 0 }> &
        IFullySignedTransaction &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>
>;

// compileTransactionMessage
compileTransactionMessage(
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>,
) satisfies Extract<CompiledMessage, { version: 'legacy' }>;
compileTransactionMessage(
    null as unknown as Extract<Transaction, { version: 0 }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'>,
) satisfies Extract<CompiledMessage, { version: number }>;

// getUnsignedTransaction
getUnsignedTransaction(
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithSignatures,
) satisfies Extract<Transaction, { version: 'legacy' }>;
getUnsignedTransaction(
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 'legacy' }> & ITransactionWithSignatures;
getUnsignedTransaction(
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
) satisfies Extract<Transaction, { version: 'legacy' }> & ITransactionWithFeePayer<'feePayer'>;
getUnsignedTransaction(
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithFeePayer<'feePayer'> &
    ITransactionWithSignatures;
getUnsignedTransaction(
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithBlockhashLifetime &
    ITransactionWithFeePayer<'feePayer'>;
getUnsignedTransaction(
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithBlockhashLifetime &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithBlockhashLifetime &
    ITransactionWithFeePayer<'feePayer'> &
    ITransactionWithSignatures;

// appendTransactionInstruction
appendTransactionInstruction(
    mockInstruction,
    null as unknown as Extract<Transaction, { version: 'legacy' }>,
) satisfies Extract<Transaction, { version: 'legacy' }> & {
    instructions: Transaction['instructions'];
};
appendTransactionInstruction(
    mockInstruction,
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithSignatures & {
        instructions: Transaction['instructions'];
    };
appendTransactionInstruction(
    mockInstruction,
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithFeePayer<'feePayer'>,
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithFeePayer<'feePayer'> & {
        instructions: Transaction['instructions'];
    };
appendTransactionInstruction(
    mockInstruction,
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithFeePayer<'feePayer'> & {
        instructions: Transaction['instructions'];
    };
appendTransactionInstruction(
    mockInstruction,
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithFeePayer<'feePayer'> &
    ITransactionWithSignatures & {
        instructions: Transaction['instructions'];
    };

// prependTransactionInstruction
prependTransactionInstruction(
    mockInstruction,
    null as unknown as Extract<Transaction, { version: 'legacy' }>,
) satisfies Extract<Transaction, { version: 'legacy' }> & {
    instructions: Transaction['instructions'];
};
prependTransactionInstruction(
    mockInstruction,
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithSignatures & {
        instructions: Transaction['instructions'];
    };
prependTransactionInstruction(
    mockInstruction,
    null as unknown as Extract<Transaction, { version: 'legacy' }> & ITransactionWithFeePayer<'feePayer'>,
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithFeePayer<'feePayer'> & {
        instructions: Transaction['instructions'];
    };
prependTransactionInstruction(
    mockInstruction,
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithFeePayer<'feePayer'> & {
        instructions: Transaction['instructions'];
    };
prependTransactionInstruction(
    mockInstruction,
    null as unknown as Extract<Transaction, { version: 'legacy' }> &
        ITransactionWithFeePayer<'feePayer'> &
        ITransactionWithSignatures,
    // @ts-expect-error Should not have signatures
) satisfies Extract<Transaction, { version: 'legacy' }> &
    ITransactionWithFeePayer<'feePayer'> &
    ITransactionWithSignatures & {
        instructions: Transaction['instructions'];
    };

{
    // assertTransactionIsFullySigned
    const transaction = {} as Parameters<typeof assertTransactionIsFullySigned>[0];
    // @ts-expect-error Should not be fully signed
    transaction satisfies IFullySignedTransaction;
    assertTransactionIsFullySigned(transaction);
    transaction satisfies IFullySignedTransaction;
}

{
    // assertIsBlockhashLifetimeTransaction
    const transaction = null as unknown as BaseTransaction;
    // @ts-expect-error Should not be blockhash lifetime
    transaction satisfies ITransactionWithBlockhashLifetime;
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
    assertIsTransactionWithBlockhashLifetime(transaction);
    transaction satisfies ITransactionWithBlockhashLifetime;
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
