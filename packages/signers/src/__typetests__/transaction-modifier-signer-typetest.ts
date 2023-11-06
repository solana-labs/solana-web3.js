import { address } from '@solana/addresses';

import {
    assertIsTransactionModifierSigner,
    isTransactionModifierSigner,
    TransactionModifierSigner,
} from '../transaction-modifier-signer';

const modifyAndSignTransaction = () => {};

{
    // [isTransactionModifierSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), modifyAndSignTransaction };
    if (isTransactionModifierSigner(potentialSigner)) {
        potentialSigner satisfies TransactionModifierSigner<'1'>;
    }
}

{
    // [assertIsTransactionModifierSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), modifyAndSignTransaction };
    assertIsTransactionModifierSigner(potentialSigner);
    potentialSigner satisfies TransactionModifierSigner<'1'>;
}
