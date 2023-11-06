import { address } from '@solana/addresses';

import { assertIsMessageSigner, isMessageSigner, MessageSigner } from '../message-signer';

const signMessage = () => {};

{
    // [isMessageSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signMessage };
    if (isMessageSigner(potentialSigner)) {
        potentialSigner satisfies MessageSigner<'1'>;
    }
}

{
    // [assertIsMessageSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), signMessage };
    assertIsMessageSigner(potentialSigner);
    potentialSigner satisfies MessageSigner<'1'>;
}
