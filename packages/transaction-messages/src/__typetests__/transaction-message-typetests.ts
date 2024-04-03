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
import { BaseTransactionMessage, TransactionMessage } from '../transaction-message';

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
) satisfies Extract<Transaction, { version: 0 }> & ITransactionWithBlockhashLifetime;
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
) satisfies Extract<TransactionMessage, { version: 0 }> & ITransactionMessageWithBlockhashLifetime;
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
    // @ts-expect-error Version should match
) satisfies Extract<Transaction, { version: 'legacy' }> & ITransactionWithBlockhashLifetime;

// setTransactionMessageLifetimeUsingBlockhash
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }>,
) satisfies Extract<TransactionMessage, { version: 'legacy' }> & ITransactionMessageWithBlockhashLifetime;
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 'legacy' }>,
    // @ts-expect-error Version should match
) satisfies Extract<Transaction, { version: 0 }> & ITransactionWithBlockhashLifetime;
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
) satisfies Extract<TransactionMessage, { version: 0 }> & ITransactionMessageWithBlockhashLifetime;
setTransactionMessageLifetimeUsingBlockhash(
    mockBlockhashLifetime,
    null as unknown as Extract<TransactionMessage, { version: 0 }>,
    // @ts-expect-error Version should match
) satisfies Extract<Transaction, { version: 'legacy' }> & ITransactionWithBlockhashLifetime;

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
