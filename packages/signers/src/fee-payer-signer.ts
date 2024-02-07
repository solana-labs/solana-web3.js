import { Address } from '@solana/addresses';
import {
    BaseTransaction,
    getUnsignedTransaction,
    ITransactionWithFeePayer,
    ITransactionWithSignatures,
} from '@solana/transactions';

import { TransactionSigner } from './transaction-signer';

export interface ITransactionWithFeePayerSigner<
    TAddress extends string = string,
    TSigner extends TransactionSigner<TAddress> = TransactionSigner<TAddress>,
> {
    readonly feePayer: Address<TAddress>;
    readonly feePayerSigner: TSigner;
}

export function setTransactionFeePayerSigner<TFeePayerAddress extends string, TTransaction extends BaseTransaction>(
    feePayerSigner: TransactionSigner<TFeePayerAddress>,
    transaction:
        | (TTransaction & ITransactionWithSignatures)
        | (TTransaction & ITransactionWithFeePayer<string> & ITransactionWithSignatures),
): Omit<TTransaction, keyof ITransactionWithSignatures> & ITransactionWithFeePayerSigner<TFeePayerAddress>;

export function setTransactionFeePayerSigner<TFeePayerAddress extends string, TTransaction extends BaseTransaction>(
    feePayerSigner: TransactionSigner<TFeePayerAddress>,
    transaction: TTransaction | (TTransaction & ITransactionWithFeePayer<string>),
): TTransaction & ITransactionWithFeePayerSigner<TFeePayerAddress>;

export function setTransactionFeePayerSigner<TFeePayerAddress extends string, TTransaction extends BaseTransaction>(
    feePayerSigner: TransactionSigner<TFeePayerAddress>,
    transaction:
        | TTransaction
        | (TTransaction & ITransactionWithFeePayer<string>)
        | (TTransaction & ITransactionWithSignatures)
        | (TTransaction & ITransactionWithFeePayer<string> & ITransactionWithSignatures),
) {
    if ('feePayer' in transaction && feePayerSigner.address === transaction.feePayer) {
        if ('feePayerSigner' in transaction) return transaction;
        const out = { ...transaction, feePayerSigner };
        Object.freeze(out);
        return out;
    }
    const out = {
        ...getUnsignedTransaction(transaction),
        feePayer: feePayerSigner.address,
        feePayerSigner,
    };
    Object.freeze(out);
    return out;
}
