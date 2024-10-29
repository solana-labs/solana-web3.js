import { BaseTransactionMessage, ITransactionMessageWithFeePayer } from '@solana/transaction-messages';

import { TransactionSigner } from './transaction-signer';

export interface ITransactionMessageWithFeePayerSigner<
    TAddress extends string = string,
    TSigner extends TransactionSigner<TAddress> = TransactionSigner<TAddress>,
> {
    readonly feePayer: TSigner;
}

export function setTransactionMessageFeePayerSigner<
    TFeePayerAddress extends string,
    TTransactionMessage extends BaseTransactionMessage &
        Partial<ITransactionMessageWithFeePayer | ITransactionMessageWithFeePayerSigner>,
>(
    feePayer: TransactionSigner<TFeePayerAddress>,
    transactionMessage: TTransactionMessage,
): ITransactionMessageWithFeePayerSigner<TFeePayerAddress> & Omit<TTransactionMessage, 'feePayer'> {
    Object.freeze(feePayer);
    const out = { ...transactionMessage, feePayer };
    Object.freeze(out);
    return out;
}
