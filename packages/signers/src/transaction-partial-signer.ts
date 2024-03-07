import { Address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_PARTIAL_SIGNER, SolanaError } from '@solana/errors';
import { CompilableTransaction } from '@solana/transactions';

import { BaseSignerConfig, SignatureDictionary } from './types';

export type TransactionPartialSignerConfig = BaseSignerConfig;

/** Defines a signer capable of signing transactions. */
export type TransactionPartialSigner<TAddress extends string = string> = Readonly<{
    address: Address<TAddress>;
    signTransactions(
        transactions: readonly CompilableTransaction[],
        config?: TransactionPartialSignerConfig,
    ): Promise<readonly SignatureDictionary[]>;
}>;

/** Checks whether the provided value implements the {@link TransactionPartialSigner} interface. */
export function isTransactionPartialSigner<TAddress extends string>(value: {
    [key: string]: unknown;
    address: Address<TAddress>;
}): value is TransactionPartialSigner<TAddress> {
    return 'signTransactions' in value && typeof value.signTransactions === 'function';
}

/** Asserts that the provided value implements the {@link TransactionPartialSigner} interface. */
export function assertIsTransactionPartialSigner<TAddress extends string>(value: {
    [key: string]: unknown;
    address: Address<TAddress>;
}): asserts value is TransactionPartialSigner<TAddress> {
    if (!isTransactionPartialSigner(value)) {
        throw new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_PARTIAL_SIGNER, {
            address: value.address,
        });
    }
}
