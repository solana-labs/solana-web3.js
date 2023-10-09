import { Base58EncodedAddress, isAddress } from '@solana/addresses';
import { CompilableTransaction, ITransactionWithSignatures } from '@solana/transactions';

/** Defines a signer capable of signing transactions. */
export type TransactionSigner<TAddress extends string = string> = {
    address: Base58EncodedAddress<TAddress>;
    signTransaction<TTransaction extends CompilableTransaction>(
        transactions: ReadonlyArray<TTransaction>
    ): Promise<ReadonlyArray<TTransaction & ITransactionWithSignatures>>;
};

/** Checks whether the provided value implements the {@link TransactionSigner} interface. */
export function isTransactionSigner<TAddress extends string>(value: {
    address: Base58EncodedAddress<TAddress>;
}): value is TransactionSigner<TAddress>;
export function isTransactionSigner(value: unknown): value is TransactionSigner;
export function isTransactionSigner(value: unknown): value is TransactionSigner {
    return (
        !!value &&
        typeof value === 'object' &&
        'address' in value &&
        typeof value.address === 'string' &&
        isAddress(value.address) &&
        'signTransaction' in value &&
        typeof value.signTransaction === 'function'
    );
}

/** Asserts that the provided value implements the {@link TransactionSigner} interface. */
export function assertIsTransactionSigner<TAddress extends string>(value: {
    address: Base58EncodedAddress<TAddress>;
}): asserts value is TransactionSigner<TAddress>;
export function assertIsTransactionSigner(value: unknown): asserts value is TransactionSigner;
export function assertIsTransactionSigner(value: unknown): asserts value is TransactionSigner {
    if (!isTransactionSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the TransactionSigner interface');
    }
}
