import { assertKeyGenerationIsAvailable } from '@solana/assertions';
import { SOLANA_ERROR__KEYS_INVALID_KEY_PAIR_BYTE_LENGTH, SolanaError } from '@solana/errors';

import { createPrivateKeyFromBytes } from './private-key';

export async function generateKeyPair(): Promise<CryptoKeyPair> {
    await assertKeyGenerationIsAvailable();
    const keyPair = await crypto.subtle.generateKey(
        /* algorithm */ 'Ed25519', // Native implementation status: https://github.com/WICG/webcrypto-secure-curves/issues/20
        /* extractable */ false, // Prevents the bytes of the private key from being visible to JS.
        /* allowed uses */ ['sign', 'verify'],
    );
    return keyPair as CryptoKeyPair;
}

export async function createKeyPairFromBytes(bytes: Uint8Array, extractable?: boolean): Promise<CryptoKeyPair> {
    if (bytes.byteLength !== 64) {
        throw new SolanaError(SOLANA_ERROR__KEYS_INVALID_KEY_PAIR_BYTE_LENGTH, { byteLength: bytes.byteLength });
    }
    const [publicKey, privateKey] = await Promise.all([
        crypto.subtle.importKey('raw', bytes.slice(32), 'Ed25519', /* extractable */ true, ['verify']),
        createPrivateKeyFromBytes(bytes.slice(0, 32), extractable),
    ]);
    return { privateKey, publicKey } as CryptoKeyPair;
}
