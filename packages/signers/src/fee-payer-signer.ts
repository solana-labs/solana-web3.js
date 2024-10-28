import { BaseTransactionMessage, ITransactionMessageWithFeePayer } from '@solana/transaction-messages';

import { isTransactionSigner, TransactionSigner } from './transaction-signer';

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
    if (
        'feePayer' in transactionMessage &&
        feePayer.address === transactionMessage.feePayer?.address &&
        isTransactionSigner(transactionMessage.feePayer)
    ) {
        return transactionMessage as unknown as ITransactionMessageWithFeePayerSigner<TFeePayerAddress> &
            Omit<TTransactionMessage, 'feePayer'>;
    }
    Object.freeze(feePayer);
    const out = { ...transactionMessage, feePayer };
    Object.freeze(out);
    return out;
}
