import { Address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_SENDING_SIGNER, SolanaError } from '@solana/errors';
import { SignatureBytes } from '@solana/keys';
import { CompilableTransaction } from '@solana/transactions';

import { BaseSignerConfig } from './types';

export type TransactionSendingSignerConfig = BaseSignerConfig;

/** Defines a signer capable of signing and sending transactions simultaneously. */
export type TransactionSendingSigner<TAddress extends string = string> = Readonly<{
    address: Address<TAddress>;
    signAndSendTransactions(
        transactions: readonly CompilableTransaction[],
        config?: TransactionSendingSignerConfig,
    ): Promise<readonly SignatureBytes[]>;
}>;

/** Checks whether the provided value implements the {@link TransactionSendingSigner} interface. */
export function isTransactionSendingSigner<TAddress extends string>(value: {
    [key: string]: unknown;
    address: Address<TAddress>;
}): value is TransactionSendingSigner<TAddress> {
    return 'signAndSendTransactions' in value && typeof value.signAndSendTransactions === 'function';
}

/** Asserts that the provided value implements the {@link TransactionSendingSigner} interface. */
export function assertIsTransactionSendingSigner<TAddress extends string>(value: {
    [key: string]: unknown;
    address: Address<TAddress>;
}): asserts value is TransactionSendingSigner<TAddress> {
    if (!isTransactionSendingSigner(value)) {
        throw new SolanaError(SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_SENDING_SIGNER, {
            address: value.address,
        });
    }
}
