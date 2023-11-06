import { Address } from '@solana/addresses';
import { CompilableTransaction, ITransactionWithSignatures } from '@solana/transactions';

/** Defines a signer capable of signing transactions. */
export type TransactionModifierSigner<TAddress extends string = string> = {
    address: Address<TAddress>;
    modifyAndSignTransaction<TTransaction extends CompilableTransaction>(
        transactions: readonly TTransaction[]
    ): Promise<readonly (TTransaction & ITransactionWithSignatures)[]>;
};

/** Checks whether the provided value implements the {@link TransactionModifierSigner} interface. */
export function isTransactionModifierSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): value is TransactionModifierSigner<TAddress> {
    return 'modifyAndSignTransaction' in value && typeof value.modifyAndSignTransaction === 'function';
}

/** Asserts that the provided value implements the {@link TransactionModifierSigner} interface. */
export function assertIsTransactionModifierSigner<TAddress extends string>(value: {
    address: Address<TAddress>;
    [key: string]: unknown;
}): asserts value is TransactionModifierSigner<TAddress> {
    if (!isTransactionModifierSigner(value)) {
        // TODO: Coded error.
        throw new Error('The provided value does not implement the TransactionModifierSigner interface');
    }
}
