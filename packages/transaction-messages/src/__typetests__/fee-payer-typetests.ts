import { Address } from '@solana/addresses';

import { ITransactionMessageWithFeePayer, setTransactionMessageFeePayer } from '../fee-payer';
import { TransactionMessage } from '../transaction-message';

const aliceAddress = 'alice' as Address<'alice'>;
const bobAddress = 'bob' as Address<'bob'>;

const message = null as unknown as TransactionMessage;

// [DESCRIBE] setTransactionFeePayer
{
    // It adds the fee payer to the new message
    {
        const messageWithFeePayer = setTransactionMessageFeePayer(aliceAddress, message);
        messageWithFeePayer satisfies ITransactionMessageWithFeePayer<'alice'>;
    }

    // It *replaces* an existing fee payer with the new one
    {
        const messageWithAliceFeePayer = null as unknown as ITransactionMessageWithFeePayer<'alice'> &
            TransactionMessage;
        const messageWithBobFeePayer = setTransactionMessageFeePayer(bobAddress, messageWithAliceFeePayer);
        // @ts-expect-error Alice should no longer be a payer.
        messageWithBobFeePayer satisfies ITransactionMessageWithFeePayer<'alice'>;
        messageWithBobFeePayer satisfies ITransactionMessageWithFeePayer<'bob'>;
    }
}
