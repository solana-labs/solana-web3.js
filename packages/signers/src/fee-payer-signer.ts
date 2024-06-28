import { Address } from '@solana/addresses';
import { BaseTransactionMessage } from '@solana/transaction-messages';

import { TransactionSigner } from './transaction-signer';

export interface ITransactionMessageWithFeePayerSigner<
    TAddress extends string = string,
    TSigner extends TransactionSigner<TAddress> = TransactionSigner<TAddress>,
> {
    readonly feePayer: Address<TAddress>;
    readonly feePayerSigner: TSigner;
}

export function setTransactionMessageFeePayerSigner<
    TFeePayerAddress extends string,
    TTransactionMessage extends BaseTransactionMessage,
>(
    feePayerSigner: TransactionSigner<TFeePayerAddress>,
    transactionMessage: TTransactionMessage,
): ITransactionMessageWithFeePayerSigner<TFeePayerAddress> & Omit<TTransactionMessage, 'feePayer' | 'feePayerSigner'> {
    if ('feePayer' in transactionMessage && feePayerSigner.address === transactionMessage.feePayer) {
        if ('feePayerSigner' in transactionMessage)
            return transactionMessage as ITransactionMessageWithFeePayerSigner<TFeePayerAddress> &
                Omit<TTransactionMessage, 'feePayer' | 'feePayerSigner'>;
        const out = { ...transactionMessage, feePayerSigner };
        Object.freeze(out);
        return out as ITransactionMessageWithFeePayerSigner<TFeePayerAddress> &
            Omit<TTransactionMessage, 'feePayer' | 'feePayerSigner'>;
    }
    const out = {
        ...transactionMessage,
        feePayer: feePayerSigner.address,
        feePayerSigner,
    };
    Object.freeze(out);
    return out;
}
