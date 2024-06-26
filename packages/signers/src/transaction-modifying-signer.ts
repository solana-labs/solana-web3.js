import { Address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_MODIFYING_SIGNER, SolanaError } from '@solana/errors';
import { Transaction } from '@solana/transactions';

import { BaseTransactionSignerConfig } from './types';

export type TransactionModifyingSignerConfig = BaseTransactionSignerConfig;

/** Defines a signer capable of signing transactions. */
export type TransactionModifyingSigner<TAddress extends string = string> = Readonly<{
    address: Address<TAddress>;
    modifyAndSignTransactions<T extends Transaction>(
        transactions: readonly T[],
        config?: TransactionModifyingSignerConfig,
    ): Promise<readonly T[]>;
}>;

/** Checks whether the provided value implements the {@link TransactionModifyingSigner} interface. */
export function isTransactionModifyingSigner<TAddress extends string>(value: {
    [key: string]: unknown;
    address: Address<TAddress>;
}): value is TransactionModifyingSigner<TAddress> {
    return 'modifyAndSignTransactions' in value && typeof value.modifyAndSignTransactions === 'function';
}

/** Asserts that the provided value implements the {@link TransactionModifyingSigner} interface. */
export function assertIsTransactionModifyingSigner<TAddress extends string>(value: {
    [key: string]: unknown;
    address: Address<TAddress>;
}): asserts value is TransactionModifyingSigner<TAddress> {
    if (!isTransactionModifyingSigner(value)) {
        throw new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_MODIFYING_SIGNER, {
            address: value.address,
        });
    }
}
