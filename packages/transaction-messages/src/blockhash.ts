import { SOLANA_ERROR__TRANSACTION__EXPECTED_BLOCKHASH_LIFETIME, SolanaError } from '@solana/errors';
import { assertIsBlockhash, type Blockhash } from '@solana/rpc-types';

import { IDurableNonceTransactionMessage } from './durable-nonce';
import { BaseTransactionMessage } from './transaction-message';

type BlockhashLifetimeConstraint = Readonly<{
    blockhash: Blockhash;
    lastValidBlockHeight: bigint;
}>;

export interface ITransactionMessageWithBlockhashLifetime {
    readonly lifetimeConstraint: BlockhashLifetimeConstraint;
}

function isTransactionMessageWithBlockhashLifetime(
    transaction: BaseTransactionMessage | (BaseTransactionMessage & ITransactionMessageWithBlockhashLifetime),
): transaction is BaseTransactionMessage & ITransactionMessageWithBlockhashLifetime {
    const lifetimeConstraintShapeMatches =
        'lifetimeConstraint' in transaction &&
        typeof transaction.lifetimeConstraint.blockhash === 'string' &&
        typeof transaction.lifetimeConstraint.lastValidBlockHeight === 'bigint';
    if (!lifetimeConstraintShapeMatches) return false;
    try {
        assertIsBlockhash(transaction.lifetimeConstraint.blockhash);
        return true;
    } catch {
        return false;
    }
}

export function assertIsTransactionMessageWithBlockhashLifetime(
    transaction: BaseTransactionMessage | (BaseTransactionMessage & ITransactionMessageWithBlockhashLifetime),
): asserts transaction is BaseTransactionMessage & ITransactionMessageWithBlockhashLifetime {
    if (!isTransactionMessageWithBlockhashLifetime(transaction)) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__EXPECTED_BLOCKHASH_LIFETIME);
    }
}

export function setTransactionMessageLifetimeUsingBlockhash<
    TTransaction extends BaseTransactionMessage & IDurableNonceTransactionMessage,
>(
    blockhashLifetimeConstraint: BlockhashLifetimeConstraint,
    transaction: TTransaction,
): ITransactionMessageWithBlockhashLifetime & Omit<TTransaction, 'lifetimeConstraint'>;

export function setTransactionMessageLifetimeUsingBlockhash<
    TTransaction extends BaseTransactionMessage | (BaseTransactionMessage & ITransactionMessageWithBlockhashLifetime),
>(
    blockhashLifetimeConstraint: BlockhashLifetimeConstraint,
    transaction: TTransaction,
): ITransactionMessageWithBlockhashLifetime & TTransaction;

export function setTransactionMessageLifetimeUsingBlockhash(
    blockhashLifetimeConstraint: BlockhashLifetimeConstraint,
    transaction: BaseTransactionMessage | (BaseTransactionMessage & ITransactionMessageWithBlockhashLifetime),
) {
    if (
        'lifetimeConstraint' in transaction &&
        transaction.lifetimeConstraint.blockhash === blockhashLifetimeConstraint.blockhash &&
        transaction.lifetimeConstraint.lastValidBlockHeight === blockhashLifetimeConstraint.lastValidBlockHeight
    ) {
        return transaction;
    }
    const out = {
        ...transaction,
        lifetimeConstraint: blockhashLifetimeConstraint,
    };
    Object.freeze(out);
    return out;
}
