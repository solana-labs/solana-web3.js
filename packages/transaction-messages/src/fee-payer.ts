import { Address } from '@solana/addresses';

import { BaseTransactionMessage } from './transaction-message';

export interface ITransactionMessageWithFeePayer<TAddress extends string = string> {
    readonly feePayer: Address<TAddress>;
}

export function setTransactionMessageFeePayer<
    TFeePayerAddress extends string,
    TTransaction extends BaseTransactionMessage,
>(
    feePayer: Address<TFeePayerAddress>,
    transaction: TTransaction,
): ITransactionMessageWithFeePayer<TFeePayerAddress> & Omit<TTransaction, 'feePayer'> {
    if ('feePayer' in transaction && feePayer === transaction.feePayer) {
        return transaction as ITransactionMessageWithFeePayer<TFeePayerAddress> & Omit<TTransaction, 'feePayer'>;
    }
    const out = {
        ...transaction,
        feePayer,
    };
    Object.freeze(out);
    return out;
}
