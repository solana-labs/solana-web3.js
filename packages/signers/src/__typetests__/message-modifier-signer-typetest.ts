import { address } from '@solana/addresses';

import {
    assertIsMessageModifierSigner,
    isMessageModifierSigner,
    MessageModifierSigner,
} from '../message-modifier-signer';

const modifyAndSignMessage = () => {};

{
    // [isMessageModifierSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), modifyAndSignMessage };
    if (isMessageModifierSigner(potentialSigner)) {
        potentialSigner satisfies MessageModifierSigner<'1'>;
    }
}

{
    // [assertIsMessageModifierSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), modifyAndSignMessage };
    assertIsMessageModifierSigner(potentialSigner);
    potentialSigner satisfies MessageModifierSigner<'1'>;
}
