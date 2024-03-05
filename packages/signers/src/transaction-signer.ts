import { Address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_SIGNER, SolanaError } from '@solana/errors';

import { isTransactionModifyingSigner, TransactionModifyingSigner } from './transaction-modifying-signer';
import { isTransactionPartialSigner, TransactionPartialSigner } from './transaction-partial-signer';
import { isTransactionSendingSigner, TransactionSendingSigner } from './transaction-sending-signer';

/** Defines a signer capable of signing transactions. */
export type TransactionSigner<TAddress extends string = string> =
    | TransactionPartialSigner<TAddress>
    | TransactionModifyingSigner<TAddress>
    | TransactionSendingSigner<TAddress>;

/** Checks whether the provided value implements the {@link TransactionSigner} interface. */
export function isTransactionSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): value is TransactionSigner<TAddress> {
    return (
        isTransactionPartialSigner(value) || isTransactionModifyingSigner(value) || isTransactionSendingSigner(value)
    );
}

/** Asserts that the provided value implements the {@link TransactionSigner} interface. */
export function assertIsTransactionSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): asserts value is TransactionSigner<TAddress> {
    if (!isTransactionSigner(value)) {
        throw new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_SIGNER, {
            address: value.address,
        });
    }
}
