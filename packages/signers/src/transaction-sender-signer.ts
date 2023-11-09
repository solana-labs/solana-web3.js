import { Address } from '@solana/addresses';
import { SignatureBytes } from '@solana/keys';
import { CompilableTransaction } from '@solana/transactions';

/** Defines a signer capable of signing and sending transactions simultaneously. */
export type TransactionSenderSigner<TAddress extends string = string> = {
    address: Address<TAddress>;
    signAndSendTransaction(transactions: readonly CompilableTransaction[]): Promise<readonly SignatureBytes[]>;
};

/** Checks whether the provided value implements the {@link TransactionSenderSigner} interface. */
export function isTransactionSenderSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): value is TransactionSenderSigner<TAddress> {
    return 'signAndSendTransaction' in value && typeof value.signAndSendTransaction === 'function';
}

/** Asserts that the provided value implements the {@link TransactionSenderSigner} interface. */
export function assertIsTransactionSenderSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): asserts value is TransactionSenderSigner<TAddress> {
    if (!isTransactionSenderSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the TransactionSenderSigner interface');
    }
}
