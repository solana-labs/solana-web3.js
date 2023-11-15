import { address } from '@solana/addresses';

import { assertIsMessageSigner, isMessageSigner, MessageSigner } from '../message-signer';

const signMessages = () => {};

{
    // [isMessageSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signMessages };
    if (isMessageSigner(potentialSigner)) {
        potentialSigner satisfies MessageSigner<'1'>;
    }
}

{
    // [assertIsMessageSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signMessages };
    assertIsMessageSigner(potentialSigner);
    potentialSigner satisfies MessageSigner<'1'>;
}
