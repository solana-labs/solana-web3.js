import { address } from '@solana/addresses';

import {
    assertIsTransactionModifyingSigner,
    isTransactionModifyingSigner,
    TransactionModifyingSigner,
} from '../transaction-modifying-signer';

const modifyAndSignTransactions = () => {};

{
    // [isTransactionModifyingSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), modifyAndSignTransactions };
    if (isTransactionModifyingSigner(potentialSigner)) {
        potentialSigner satisfies TransactionModifyingSigner<'1'>;
    }
}

{
    // [assertIsTransactionModifyingSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), modifyAndSignTransactions };
    assertIsTransactionModifyingSigner(potentialSigner);
    potentialSigner satisfies TransactionModifyingSigner<'1'>;
}
