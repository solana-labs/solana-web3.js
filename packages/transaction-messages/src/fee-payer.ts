import { Address } from '@solana/addresses';

import { BaseTransactionMessage } from './transaction-message';

export interface ITransactionMessageWithFeePayer<TAddress extends string = string> {
    readonly feePayer: Readonly<{ address: Address<TAddress> }>;
}

export function setTransactionMessageFeePayer<
    TFeePayerAddress extends string,
    TTransactionMessage extends BaseTransactionMessage & Partial<ITransactionMessageWithFeePayer>,
>(
    feePayer: Address<TFeePayerAddress>,
    transactionMessage: TTransactionMessage,
): ITransactionMessageWithFeePayer<TFeePayerAddress> & Omit<TTransactionMessage, 'feePayer'> {
    if (
        'feePayer' in transactionMessage &&
        feePayer === transactionMessage.feePayer?.address &&
        isAddressOnlyFeePayer(transactionMessage.feePayer)
    ) {
        return transactionMessage as unknown as ITransactionMessageWithFeePayer<TFeePayerAddress> &
            Omit<TTransactionMessage, 'feePayer'>;
    }
    const out = {
        ...transactionMessage,
        feePayer: Object.freeze({ address: feePayer }),
    };
    Object.freeze(out);
    return out;
}

function isAddressOnlyFeePayer(
    feePayer: Partial<ITransactionMessageWithFeePayer>['feePayer'],
): feePayer is { address: Address } {
    return (
        !!feePayer &&
        'address' in feePayer &&
        typeof feePayer.address === 'string' &&
        Object.keys(feePayer).length === 1
    );
}
