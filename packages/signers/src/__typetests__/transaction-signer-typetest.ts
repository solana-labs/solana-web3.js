import { address } from '@solana/addresses';

import { assertIsTransactionSigner, isTransactionSigner, TransactionSigner } from '../transaction-signer';

const signTransaction = () => {};

{
    // [isTransactionSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signTransaction };
    if (isTransactionSigner(potentialSigner)) {
        potentialSigner satisfies TransactionSigner<'1'>;
    }
}

{
    // [assertIsTransactionSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signTransaction };
    assertIsTransactionSigner(potentialSigner);
    potentialSigner satisfies TransactionSigner<'1'>;
}
