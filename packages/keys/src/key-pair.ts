import { assertKeyGenerationIsAvailable, assertPRNGIsAvailable } from '@solana/assertions';
import {
    SOLANA_ERROR__KEYS__INVALID_KEY_PAIR_BYTE_LENGTH,
    SOLANA_ERROR__KEYS__PUBLIC_KEY_MUST_MATCH_PRIVATE_KEY,
    SolanaError,
} from '@solana/errors';

import { createPrivateKeyFromBytes } from './private-key';
import { signBytes, verifySignature } from './signatures';

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
    assertPRNGIsAvailable();

    if (bytes.byteLength !== 64) {
        throw new SolanaError(SOLANA_ERROR__KEYS__INVALID_KEY_PAIR_BYTE_LENGTH, { byteLength: bytes.byteLength });
    }
    const [publicKey, privateKey] = await Promise.all([
        crypto.subtle.importKey('raw', bytes.slice(32), 'Ed25519', /* extractable */ true, ['verify']),
        createPrivateKeyFromBytes(bytes.slice(0, 32), extractable),
    ]);

    // Verify the key pair
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const signedData = await signBytes(privateKey, randomBytes);
    const isValid = await verifySignature(publicKey, signedData, randomBytes);
    if (!isValid) {
        throw new SolanaError(SOLANA_ERROR__KEYS__PUBLIC_KEY_MUST_MATCH_PRIVATE_KEY);
    }

    return { privateKey, publicKey } as CryptoKeyPair;
}
