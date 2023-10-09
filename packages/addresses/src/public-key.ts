import { assertKeyExporterIsAvailable } from '@solana/assertions';

import { Base58EncodedAddress, getAddressCodec } from './address';

export async function getAddressFromPublicKey(publicKey: CryptoKey): Promise<Base58EncodedAddress> {
    await assertKeyExporterIsAvailable();
    if (publicKey.type !== 'public' || publicKey.algorithm.name !== 'Ed25519') {
        // TODO: Coded error.
        throw new Error('The `CryptoKey` must be an `Ed25519` public key');
    }
    const publicKeyBytes = await crypto.subtle.exportKey('raw', publicKey);
    const [base58EncodedAddress] = getAddressCodec().deserialize(new Uint8Array(publicKeyBytes));
    return base58EncodedAddress;
}
