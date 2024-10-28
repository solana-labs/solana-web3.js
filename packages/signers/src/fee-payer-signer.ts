import { Address } from '@solana/addresses';
import { BaseTransactionMessage, ITransactionMessageWithFeePayer } from '@solana/transaction-messages';

import { TransactionSigner } from './transaction-signer';

export interface ITransactionMessageWithFeePayerSigner<
    TAddress extends string = string,
    TSigner extends TransactionSigner<TAddress> = TransactionSigner<TAddress>,
> {
    readonly feePayer: { address: Address<TAddress> };
    readonly feePayerSigner: TSigner;
}

export function setTransactionMessageFeePayerSigner<
    TFeePayerAddress extends string,
    TTransactionMessage extends BaseTransactionMessage &
        Partial<ITransactionMessageWithFeePayer | ITransactionMessageWithFeePayerSigner>,
>(
    feePayerSigner: TransactionSigner<TFeePayerAddress>,
    transactionMessage: TTransactionMessage,
): ITransactionMessageWithFeePayerSigner<TFeePayerAddress> & Omit<TTransactionMessage, 'feePayer' | 'feePayerSigner'> {
    if ('feePayer' in transactionMessage && feePayerSigner.address === transactionMessage.feePayer?.address) {
        if ('feePayerSigner' in transactionMessage)
            return transactionMessage as unknown as ITransactionMessageWithFeePayerSigner<TFeePayerAddress> &
                Omit<TTransactionMessage, 'feePayer' | 'feePayerSigner'>;
        const out = { ...transactionMessage, feePayerSigner };
        Object.freeze(out);
        return out as unknown as ITransactionMessageWithFeePayerSigner<TFeePayerAddress> &
            Omit<TTransactionMessage, 'feePayer' | 'feePayerSigner'>;
    }
    const out = {
        ...transactionMessage,
        feePayer: Object.freeze({ address: feePayerSigner.address }),
        feePayerSigner,
    };
    Object.freeze(out);
    return out;
}
