import { Address } from '@solana/addresses';

import { ITransactionWithSignatures } from './signatures';
import { BaseTransaction } from './types';
import { getUnsignedTransaction } from './unsigned-transaction';

export interface ITransactionWithFeePayer<TAddress extends string = string> {
    readonly feePayer: Address<TAddress>;
}

export function setTransactionFeePayer<TFeePayerAddress extends string, TTransaction extends BaseTransaction>(
    feePayer: Address<TFeePayerAddress>,
    transaction:
        | (ITransactionWithFeePayer<string> & ITransactionWithSignatures & TTransaction)
        | (ITransactionWithSignatures & TTransaction),
): ITransactionWithFeePayer<TFeePayerAddress> & Omit<TTransaction, keyof ITransactionWithSignatures>;

export function setTransactionFeePayer<TFeePayerAddress extends string, TTransaction extends BaseTransaction>(
    feePayer: Address<TFeePayerAddress>,
    transaction: TTransaction | (ITransactionWithFeePayer<string> & TTransaction),
): ITransactionWithFeePayer<TFeePayerAddress> & TTransaction;

export function setTransactionFeePayer<TFeePayerAddress extends string, TTransaction extends BaseTransaction>(
    feePayer: Address<TFeePayerAddress>,
    transaction:
        | TTransaction
        | (ITransactionWithFeePayer<string> & ITransactionWithSignatures & TTransaction)
        | (ITransactionWithFeePayer<string> & TTransaction)
        | (ITransactionWithSignatures & TTransaction),
) {
    if ('feePayer' in transaction && feePayer === transaction.feePayer) {
        return transaction;
    }
    const out = {
        // A change in fee payer implies that any existing signatures are invalid.
        ...getUnsignedTransaction(transaction),
        feePayer,
    };
    Object.freeze(out);
    return out;
}
