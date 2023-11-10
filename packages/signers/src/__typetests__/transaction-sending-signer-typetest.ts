import { address } from '@solana/addresses';

import {
    assertIsTransactionSendingSigner,
    isTransactionSendingSigner,
    TransactionSendingSigner,
} from '../transaction-sending-signer';

const signAndSendTransaction = () => {};

{
    // [isTransactionSendingSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signAndSendTransaction };
    if (isTransactionSendingSigner(potentialSigner)) {
        potentialSigner satisfies TransactionSendingSigner<'1'>;
    }
}

{
    // [assertIsTransactionSendingSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signAndSendTransaction };
    assertIsTransactionSendingSigner(potentialSigner);
    potentialSigner satisfies TransactionSendingSigner<'1'>;
}
