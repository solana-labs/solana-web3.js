import { Base58EncodedAddress, isAddress } from '@solana/addresses';
import { CompilableTransaction, TransactionSignature } from '@solana/transactions';

/** Defines a signer capable of signing and sending transactions simultaneously. */
export type TransactionSenderSigner<TAddress extends string = string> = {
    address: Base58EncodedAddress<TAddress>;
    signAndSendTransaction<TTransaction extends CompilableTransaction>(
        transactions: ReadonlyArray<TTransaction>
    ): Promise<ReadonlyArray<TransactionSignature>>;
};

/** Checks whether the provided value implements the {@link TransactionSenderSigner} interface. */
export function isTransactionSenderSigner<TAddress extends string>(value: {
    address: Base58EncodedAddress<TAddress>;
}): value is TransactionSenderSigner<TAddress>;
export function isTransactionSenderSigner(value: unknown): value is TransactionSenderSigner;
export function isTransactionSenderSigner(value: unknown): value is TransactionSenderSigner {
    return (
        !!value &&
        typeof value === 'object' &&
        'address' in value &&
        typeof value.address === 'string' &&
        isAddress(value.address) &&
        'signAndSendTransaction' in value &&
        typeof value.signAndSendTransaction === 'function'
    );
}

/** Asserts that the provided value implements the {@link TransactionSenderSigner} interface. */
export function assertIsTransactionSenderSigner<TAddress extends string>(value: {
    address: Base58EncodedAddress<TAddress>;
}): asserts value is TransactionSenderSigner<TAddress>;
export function assertIsTransactionSenderSigner(value: unknown): asserts value is TransactionSenderSigner;
export function assertIsTransactionSenderSigner(value: unknown): asserts value is TransactionSenderSigner {
    if (!isTransactionSenderSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the TransactionSenderSigner interface');
    }
}
