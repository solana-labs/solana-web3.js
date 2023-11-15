import { Address } from '@solana/addresses';
import { SignatureBytes } from '@solana/keys';
import { CompilableTransaction } from '@solana/transactions';

/** Defines a signer capable of signing and sending transactions simultaneously. */
export type TransactionSendingSigner<TAddress extends string = string> = Readonly<{
    address: Address<TAddress>;
    signAndSendTransactions(transactions: readonly CompilableTransaction[]): Promise<readonly SignatureBytes[]>;
}>;

/** Checks whether the provided value implements the {@link TransactionSendingSigner} interface. */
export function isTransactionSendingSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): value is TransactionSendingSigner<TAddress> {
    return 'signAndSendTransactions' in value && typeof value.signAndSendTransactions === 'function';
}

/** Asserts that the provided value implements the {@link TransactionSendingSigner} interface. */
export function assertIsTransactionSendingSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): asserts value is TransactionSendingSigner<TAddress> {
    if (!isTransactionSendingSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the TransactionSendingSigner interface');
    }
}
