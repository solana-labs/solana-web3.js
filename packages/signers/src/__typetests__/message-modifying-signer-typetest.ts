import { address } from '@solana/addresses';

import {
    assertIsMessageModifyingSigner,
    isMessageModifyingSigner,
    MessageModifyingSigner,
} from '../message-modifying-signer';

const modifyAndSignMessage = () => {};

{
    // [isMessageModifyingSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), modifyAndSignMessage };
    if (isMessageModifyingSigner(potentialSigner)) {
        potentialSigner satisfies MessageModifyingSigner<'1'>;
    }
}

{
    // [assertIsMessageModifyingSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), modifyAndSignMessage };
    assertIsMessageModifyingSigner(potentialSigner);
    potentialSigner satisfies MessageModifyingSigner<'1'>;
}
