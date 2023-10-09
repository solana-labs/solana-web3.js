import { address } from '@solana/addresses';
import {
    TransactionSenderSigner,
    assertIsTransactionSenderSigner,
    isTransactionSenderSigner,
} from '../transaction-sender-signer';

const signAndSendTransaction = () => {};

{
    // [isTransactionSenderSigner]: It keeps track of the address type parameter when the address is a valid Base58EncodedAddress.
    const potentialSigner = { address: address('1'), signAndSendTransaction };
    if (isTransactionSenderSigner(potentialSigner)) {
        potentialSigner satisfies TransactionSenderSigner<'1'>;
    }
}

{
    // [isTransactionSenderSigner]: It uses `string` as the address type parameter if the address is not a valid Base58EncodedAddress.
    const potentialSigner = { address: '1', signAndSendTransaction };
    if (isTransactionSenderSigner(potentialSigner)) {
        potentialSigner satisfies TransactionSenderSigner;
        // @ts-expect-error Address is not a Base58EncodedAddress.
        potentialSigner satisfies TransactionSenderSigner<'1'>;
    }
}

{
    // [assertIsTransactionSenderSigner]: It keeps track of the address type parameter when the address is a valid Base58EncodedAddress.
    const potentialSigner = { address: address('1'), signAndSendTransaction };
    assertIsTransactionSenderSigner(potentialSigner);
    potentialSigner satisfies TransactionSenderSigner<'1'>;
}

{
    // [assertIsTransactionSenderSigner]: It uses `string` as the address type parameter if the address is not a valid Base58EncodedAddress.
    const potentialSigner = { address: '1', signAndSendTransaction };
    assertIsTransactionSenderSigner(potentialSigner);
    potentialSigner satisfies TransactionSenderSigner;
    // @ts-expect-error Address is not a Base58EncodedAddress.
    potentialSigner satisfies TransactionSenderSigner<'1'>;
}
