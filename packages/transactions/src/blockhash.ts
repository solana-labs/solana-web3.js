import { SOLANA_ERROR__TRANSACTION__EXPECTED_BLOCKHASH_LIFETIME, SolanaError } from '@solana/errors';
import { assertIsBlockhash, type Blockhash } from '@solana/rpc-types';

import { IDurableNonceTransaction } from './durable-nonce';
import { ITransactionWithSignatures } from './signatures';
import { BaseTransaction } from './types';
import { getUnsignedTransaction } from './unsigned-transaction';

type BlockhashLifetimeConstraint = Readonly<{
    blockhash: Blockhash;
    lastValidBlockHeight: bigint;
}>;

export interface ITransactionWithBlockhashLifetime {
    readonly lifetimeConstraint: BlockhashLifetimeConstraint;
}

function isTransactionWithBlockhashLifetime(
    transaction: BaseTransaction | (BaseTransaction & ITransactionWithBlockhashLifetime),
): transaction is BaseTransaction & ITransactionWithBlockhashLifetime {
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

export function assertIsTransactionWithBlockhashLifetime(
    transaction: BaseTransaction | (BaseTransaction & ITransactionWithBlockhashLifetime),
): asserts transaction is BaseTransaction & ITransactionWithBlockhashLifetime {
    if (!isTransactionWithBlockhashLifetime(transaction)) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__EXPECTED_BLOCKHASH_LIFETIME);
    }
}

export function setTransactionLifetimeUsingBlockhash<TTransaction extends BaseTransaction & IDurableNonceTransaction>(
    blockhashLifetimeConstraint: BlockhashLifetimeConstraint,
    transaction: TTransaction | (ITransactionWithSignatures & TTransaction),
): ITransactionWithBlockhashLifetime & Omit<TTransaction, keyof ITransactionWithSignatures | 'lifetimeConstraint'>;

export function setTransactionLifetimeUsingBlockhash<
    TTransaction extends BaseTransaction | (BaseTransaction & ITransactionWithBlockhashLifetime),
>(
    blockhashLifetimeConstraint: BlockhashLifetimeConstraint,
    transaction: TTransaction | (ITransactionWithSignatures & TTransaction),
): ITransactionWithBlockhashLifetime & Omit<TTransaction, keyof ITransactionWithSignatures>;

export function setTransactionLifetimeUsingBlockhash(
    blockhashLifetimeConstraint: BlockhashLifetimeConstraint,
    transaction: BaseTransaction | (BaseTransaction & ITransactionWithBlockhashLifetime),
) {
    if (
        'lifetimeConstraint' in transaction &&
        transaction.lifetimeConstraint.blockhash === blockhashLifetimeConstraint.blockhash &&
        transaction.lifetimeConstraint.lastValidBlockHeight === blockhashLifetimeConstraint.lastValidBlockHeight
    ) {
        return transaction;
    }
    const out = {
        // A change in lifetime constraint implies that any existing signatures are invalid.
        ...getUnsignedTransaction(transaction),
        lifetimeConstraint: blockhashLifetimeConstraint,
    };
    Object.freeze(out);
    return out;
}
