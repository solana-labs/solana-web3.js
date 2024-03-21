import { assertKeyExporterIsAvailable } from '@solana/assertions';
import { SOLANA_ERROR__ADDRESSES__INVALID_ED25519_PUBLIC_KEY, SolanaError } from '@solana/errors';

import { Address, getAddressDecoder } from './address';

export async function getAddressFromPublicKey(publicKey: CryptoKey): Promise<Address> {
    assertKeyExporterIsAvailable();
    if (publicKey.type !== 'public' || publicKey.algorithm.name !== 'Ed25519') {
        throw new SolanaError(SOLANA_ERROR__ADDRESSES__INVALID_ED25519_PUBLIC_KEY);
    }
    const publicKeyBytes = await crypto.subtle.exportKey('raw', publicKey);
    return getAddressDecoder().decode(new Uint8Array(publicKeyBytes));
}
