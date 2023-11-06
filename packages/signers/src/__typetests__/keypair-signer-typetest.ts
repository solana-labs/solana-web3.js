import { address } from '@solana/addresses';

import { assertIsKeyPairSigner, isKeyPairSigner, KeyPairSigner } from '../keypair-signer';

const keyPair = {} as CryptoKeyPair;
const signMessage = () => {};
const signTransaction = () => {};

{
    // [isKeyPairSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), keyPair, signMessage, signTransaction };
    if (isKeyPairSigner(potentialSigner)) {
        potentialSigner satisfies KeyPairSigner<'1'>;
    }
}

{
    // [assertIsKeyPairSigner]: It keeps track of the address type parameter when the address is a valid Address.
    const potentialSigner = { address: address('1'), keyPair, signMessage, signTransaction };
    assertIsKeyPairSigner(potentialSigner);
    potentialSigner satisfies KeyPairSigner<'1'>;
}
