import { address } from '@solana/addresses';

import {
    assertIsTransactionPartialSigner,
    isTransactionPartialSigner,
    TransactionPartialSigner,
} from '../transaction-partial-signer';

const signTransaction = () => {};

{
    // [isTransactionPartialSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signTransaction };
    if (isTransactionPartialSigner(potentialSigner)) {
        potentialSigner satisfies TransactionPartialSigner<'1'>;
    }
}

{
    // [assertIsTransactionPartialSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signTransaction };
    assertIsTransactionPartialSigner(potentialSigner);
    potentialSigner satisfies TransactionPartialSigner<'1'>;
}
