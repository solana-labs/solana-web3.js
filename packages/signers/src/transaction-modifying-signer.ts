import { Address } from '@solana/addresses';
import { CompilableTransaction } from '@solana/transactions';

/** Defines a signer capable of signing transactions. */
export type TransactionModifyingSigner<TAddress extends string = string> = Readonly<{
    address: Address<TAddress>;
    modifyAndSignTransactions<TTransaction extends CompilableTransaction>(
        transactions: readonly TTransaction[]
    ): Promise<readonly TTransaction[]>;
}>;

/** Checks whether the provided value implements the {@link TransactionModifyingSigner} interface. */
export function isTransactionModifyingSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): value is TransactionModifyingSigner<TAddress> {
    return 'modifyAndSignTransactions' in value && typeof value.modifyAndSignTransactions === 'function';
}

/** Asserts that the provided value implements the {@link TransactionModifyingSigner} interface. */
export function assertIsTransactionModifyingSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): asserts value is TransactionModifyingSigner<TAddress> {
    if (!isTransactionModifyingSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the TransactionModifyingSigner interface');
    }
}
