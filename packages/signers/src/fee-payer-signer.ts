import { Address } from '@solana/addresses';
import { BaseTransactionMessage, ITransactionMessageWithFeePayer } from '@solana/transaction-messages';

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
    transactionMessage: TTransactionMessage | (ITransactionMessageWithFeePayer<string> & TTransactionMessage),
): ITransactionMessageWithFeePayerSigner<TFeePayerAddress> & TTransactionMessage {
    if ('feePayer' in transactionMessage && feePayerSigner.address === transactionMessage.feePayer) {
        if ('feePayerSigner' in transactionMessage)
            return transactionMessage as ITransactionMessageWithFeePayerSigner<TFeePayerAddress> & TTransactionMessage;
        const out = { ...transactionMessage, feePayerSigner };
        Object.freeze(out);
        return out as ITransactionMessageWithFeePayerSigner<TFeePayerAddress> & TTransactionMessage;
    }
    const out = {
        ...transactionMessage,
        feePayer: feePayerSigner.address,
        feePayerSigner,
    };
    Object.freeze(out);
    return out;
}
