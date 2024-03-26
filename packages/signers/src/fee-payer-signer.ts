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
        | (ITransactionWithFeePayer<string> & ITransactionWithSignatures & TTransaction)
        | (ITransactionWithSignatures & TTransaction),
): ITransactionWithFeePayerSigner<TFeePayerAddress> & Omit<TTransaction, keyof ITransactionWithSignatures>;

export function setTransactionFeePayerSigner<TFeePayerAddress extends string, TTransaction extends BaseTransaction>(
    feePayerSigner: TransactionSigner<TFeePayerAddress>,
    transaction: TTransaction | (ITransactionWithFeePayer<string> & TTransaction),
): ITransactionWithFeePayerSigner<TFeePayerAddress> & TTransaction;

export function setTransactionFeePayerSigner<TFeePayerAddress extends string, TTransaction extends BaseTransaction>(
    feePayerSigner: TransactionSigner<TFeePayerAddress>,
    transaction:
        | TTransaction
        | (ITransactionWithFeePayer<string> & ITransactionWithSignatures & TTransaction)
        | (ITransactionWithFeePayer<string> & TTransaction)
        | (ITransactionWithSignatures & TTransaction),
) {
    if ('feePayer' in transaction && feePayerSigner.address === transaction.feePayer) {
        if ('feePayerSigner' in transaction) return transaction;
        const out = { ...transaction, feePayerSigner };
        Object.freeze(out);
        return out;
    }
    const out = {
        // A change in fee payer implies that any existing signatures are invalid.
        ...getUnsignedTransaction(transaction),
        feePayer: feePayerSigner.address,
        feePayerSigner,
    };
    Object.freeze(out);
    return out;
}
