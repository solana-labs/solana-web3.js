import { address } from '@solana/addresses';
import { MessageSigner, assertIsMessageSigner, isMessageSigner } from '../message-signer';

const signMessage = () => {};

{
    // [isMessageSigner]: It keeps track of the address type parameter when the address is a valid Base58EncodedAddress.
    const potentialSigner = { address: address('1'), signMessage };
    if (isMessageSigner(potentialSigner)) {
        potentialSigner satisfies MessageSigner<'1'>;
    }
}

{
    // [isMessageSigner]: It uses `string` as the address type parameter if the address is not a valid Base58EncodedAddress.
    const potentialSigner = { address: '1', signMessage };
    if (isMessageSigner(potentialSigner)) {
        potentialSigner satisfies MessageSigner;
        // @ts-expect-error Address is not a Base58EncodedAddress.
        potentialSigner satisfies MessageSigner<'1'>;
    }
}

{
    // [assertIsMessageSigner]: It keeps track of the address type parameter when the address is a valid Base58EncodedAddress.
    const potentialSigner = { address: address('1'), signMessage };
    assertIsMessageSigner(potentialSigner);
    potentialSigner satisfies MessageSigner<'1'>;
}

{
    // [assertIsMessageSigner]: It uses `string` as the address type parameter if the address is not a valid Base58EncodedAddress.
    const potentialSigner = { address: '1', signMessage };
    assertIsMessageSigner(potentialSigner);
    potentialSigner satisfies MessageSigner;
    // @ts-expect-error Address is not a Base58EncodedAddress.
    potentialSigner satisfies MessageSigner<'1'>;
}
