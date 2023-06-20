import { Base58EncodedAddress } from '@solana/keys';

import { ITransactionWithSignatures } from './signatures';
import { BaseTransaction } from './types';

export interface ITransactionWithFeePayer<TAddress extends string = string> {
    readonly feePayer: Base58EncodedAddress<TAddress>;
}

export function setTransactionFeePayer<TFeePayerAddress extends string, TTransaction extends BaseTransaction>(
    feePayer: Base58EncodedAddress<TFeePayerAddress>,
    transaction:
        | TTransaction
        | (TTransaction & ITransactionWithFeePayer<TFeePayerAddress>)
        | (TTransaction & ITransactionWithSignatures)
        | (TTransaction & ITransactionWithFeePayer<TFeePayerAddress> & ITransactionWithSignatures)
):
    | (TTransaction & ITransactionWithFeePayer<TFeePayerAddress>)
    | (Omit<TTransaction, keyof ITransactionWithSignatures> & ITransactionWithFeePayer<TFeePayerAddress>) {
    if ('feePayer' in transaction && feePayer === transaction.feePayer) {
        return transaction;
    }
    let out;
    if ('signatures' in transaction) {
        // The implication of the fee payer changing is that any existing signatures are invalid.
        const {
            signatures: _, // eslint-disable-line @typescript-eslint/no-unused-vars
            ...unsignedTransaction
        } = transaction;
        out = {
            ...unsignedTransaction,
            feePayer,
        };
    } else {
        out = {
            ...transaction,
            feePayer,
        };
    }
    Object.freeze(out);
    return out;
}
