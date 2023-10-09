import { address } from '@solana/addresses';
import { TransactionSigner, assertIsTransactionSigner, isTransactionSigner } from '../transaction-signer';

const signTransaction = () => {};

{
    // [isTransactionSigner]: It keeps track of the address type parameter when the address is a valid Base58EncodedAddress.
    const potentialSigner = { address: address('1'), signTransaction };
    if (isTransactionSigner(potentialSigner)) {
        potentialSigner satisfies TransactionSigner<'1'>;
    }
}

{
    // [isTransactionSigner]: It uses `string` as the address type parameter if the address is not a valid Base58EncodedAddress.
    const potentialSigner = { address: '1', signTransaction };
    if (isTransactionSigner(potentialSigner)) {
        potentialSigner satisfies TransactionSigner;
        // @ts-expect-error Address is not a Base58EncodedAddress.
        potentialSigner satisfies TransactionSigner<'1'>;
    }
}

{
    // [assertIsTransactionSigner]: It keeps track of the address type parameter when the address is a valid Base58EncodedAddress.
    const potentialSigner = { address: address('1'), signTransaction };
    assertIsTransactionSigner(potentialSigner);
    potentialSigner satisfies TransactionSigner<'1'>;
}

{
    // [assertIsTransactionSigner]: It uses `string` as the address type parameter if the address is not a valid Base58EncodedAddress.
    const potentialSigner = { address: '1', signTransaction };
    assertIsTransactionSigner(potentialSigner);
    potentialSigner satisfies TransactionSigner;
    // @ts-expect-error Address is not a Base58EncodedAddress.
    potentialSigner satisfies TransactionSigner<'1'>;
}
