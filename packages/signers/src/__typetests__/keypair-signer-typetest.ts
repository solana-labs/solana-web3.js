import { address } from '@solana/addresses';
import { KeyPairSigner, assertIsKeyPairSigner, isKeyPairSigner } from '../keypair-signer';

const keyPair = {} as CryptoKeyPair;
const signMessage = () => {};
const signTransaction = () => {};

{
    // [isKeyPairSigner]: It keeps track of the address type parameter when the address is a valid Base58EncodedAddress.
    const potentialSigner = { keyPair, address: address('1'), signMessage, signTransaction };
    if (isKeyPairSigner(potentialSigner)) {
        potentialSigner satisfies KeyPairSigner<'1'>;
    }
}

{
    // [isKeyPairSigner]: It uses `string` as the address type parameter if the address is not a valid Base58EncodedAddress.
    const potentialSigner = { keyPair, address: '1', signMessage, signTransaction };
    if (isKeyPairSigner(potentialSigner)) {
        potentialSigner satisfies KeyPairSigner;
        // @ts-expect-error Address is not a Base58EncodedAddress.
        potentialSigner satisfies KeyPairSigner<'1'>;
    }
}

{
    // [assertIsKeyPairSigner]: It keeps track of the address type parameter when the address is a valid Base58EncodedAddress.
    const potentialSigner = { keyPair, address: address('1'), signMessage, signTransaction };
    assertIsKeyPairSigner(potentialSigner);
    potentialSigner satisfies KeyPairSigner<'1'>;
}

{
    // [assertIsKeyPairSigner]: It uses `string` as the address type parameter if the address is not a valid Base58EncodedAddress.
    const potentialSigner = { keyPair, address: '1', signMessage, signTransaction };
    assertIsKeyPairSigner(potentialSigner);
    potentialSigner satisfies KeyPairSigner;
    // @ts-expect-error Address is not a Base58EncodedAddress.
    potentialSigner satisfies KeyPairSigner<'1'>;
}
