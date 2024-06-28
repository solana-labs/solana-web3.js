import { ITransactionMessageWithFeePayer, TransactionMessage } from '@solana/transaction-messages';

import { ITransactionMessageWithFeePayerSigner, setTransactionMessageFeePayerSigner } from '../fee-payer-signer';
import { TransactionSigner } from '../transaction-signer';

const aliceSigner = null as unknown as TransactionSigner<'alice'>;
const bobSigner = null as unknown as TransactionSigner<'bob'>;

const message = null as unknown as TransactionMessage;

// [DESCRIBE] setTransactionFeePayerSigner
{
    // It adds the fee payer signer to the new message
    {
        const messageWithFeePayer = setTransactionMessageFeePayerSigner(aliceSigner, message);
        messageWithFeePayer satisfies ITransactionMessageWithFeePayerSigner<'alice'>;
    }

    // It *replaces* an existing fee payer signer with the new one
    {
        const messageWithAliceFeePayerSigner = null as unknown as ITransactionMessageWithFeePayerSigner<'alice'> &
            TransactionMessage;
        const messageWithBobFeePayerSigner = setTransactionMessageFeePayerSigner(
            bobSigner,
            messageWithAliceFeePayerSigner,
        );
        // @ts-expect-error Alice should no longer be a payer.
        messageWithBobFeePayerSigner satisfies ITransactionMessageWithFeePayerSigner<'alice'>;
        messageWithBobFeePayerSigner satisfies ITransactionMessageWithFeePayerSigner<'bob'>;
    }

    // It *replaces* an existing fee payer address with the new signer
    {
        const messageWithMalloryFeePayer = null as unknown as ITransactionMessageWithFeePayer<'mallory'> &
            TransactionMessage;
        const messageWithBobFeePayerSigner = setTransactionMessageFeePayerSigner(bobSigner, messageWithMalloryFeePayer);
        // @ts-expect-error Mallory should no longer be a payer.
        messageWithBobFeePayerSigner satisfies ITransactionMessageWithFeePayer<'mallory'>;
        messageWithBobFeePayerSigner satisfies ITransactionMessageWithFeePayerSigner<'bob'>;
    }
}
