import { address } from '@solana/addresses';

import {
    assertIsTransactionSenderSigner,
    isTransactionSenderSigner,
    TransactionSenderSigner,
} from '../transaction-sender-signer';

const signAndSendTransaction = () => {};

{
    // [isTransactionSenderSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signAndSendTransaction };
    if (isTransactionSenderSigner(potentialSigner)) {
        potentialSigner satisfies TransactionSenderSigner<'1'>;
    }
}

{
    // [assertIsTransactionSenderSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signAndSendTransaction };
    assertIsTransactionSenderSigner(potentialSigner);
    potentialSigner satisfies TransactionSenderSigner<'1'>;
}
