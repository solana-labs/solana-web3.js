import { address } from '@solana/addresses';

import {
    assertIsTransactionPartialSigner,
    isTransactionPartialSigner,
    TransactionPartialSigner,
} from '../transaction-partial-signer';

const signTransactions = () => {};

{
    // [isTransactionPartialSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signTransactions };
    if (isTransactionPartialSigner(potentialSigner)) {
        potentialSigner satisfies TransactionPartialSigner<'1'>;
    }
}

{
    // [assertIsTransactionPartialSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signTransactions };
    assertIsTransactionPartialSigner(potentialSigner);
    potentialSigner satisfies TransactionPartialSigner<'1'>;
}
