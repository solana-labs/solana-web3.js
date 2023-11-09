import { Address } from '@solana/addresses';
import { CompilableTransaction } from '@solana/transactions';

import { SignatureDictionary } from './types';

/** Defines a signer capable of signing transactions. */
export type TransactionPartialSigner<TAddress extends string = string> = {
    address: Address<TAddress>;
    signTransaction(transactions: readonly CompilableTransaction[]): Promise<readonly SignatureDictionary[]>;
};

/** Checks whether the provided value implements the {@link TransactionPartialSigner} interface. */
export function isTransactionPartialSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): value is TransactionPartialSigner<TAddress> {
    return 'signTransaction' in value && typeof value.signTransaction === 'function';
}

/** Asserts that the provided value implements the {@link TransactionPartialSigner} interface. */
export function assertIsTransactionPartialSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): asserts value is TransactionPartialSigner<TAddress> {
    if (!isTransactionPartialSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the TransactionPartialSigner interface');
    }
}
