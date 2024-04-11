import { address } from '@solana/addresses';

import {
    assertIsTransactionSendingSigner,
    isTransactionSendingSigner,
    TransactionSendingSigner,
} from '../transaction-sending-signer';

const signAndSendTransactions = () => {};

{
    // [isTransactionSendingSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signAndSendTransactions };
    if (isTransactionSendingSigner(potentialSigner)) {
        potentialSigner satisfies TransactionSendingSigner<'1'>;
    }
}

{
    // [assertIsTransactionSendingSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signAndSendTransactions };
    assertIsTransactionSendingSigner(potentialSigner);
    potentialSigner satisfies TransactionSendingSigner<'1'>;
}
