import { assertKeyGenerationIsAvailable } from '@solana/assertions';
import { SOLANA_ERROR__KEYS__INVALID_KEY_PAIR_BYTE_LENGTH, SolanaError } from '@solana/errors';

import { createPrivateKeyFromBytes } from './private-key';
import { verifySignature, signBytes } from './signatures';

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
        throw new SolanaError(SOLANA_ERROR__KEYS__INVALID_KEY_PAIR_BYTE_LENGTH, { byteLength: bytes.byteLength });
    }
    const [publicKey, privateKey] = await Promise.all([
        crypto.subtle.importKey('raw', bytes.slice(32), 'Ed25519', /* extractable */ true, ['verify']),
        createPrivateKeyFromBytes(bytes.slice(0, 32), extractable),
    ]);
    const signedData = await signBytes(privateKey, new Uint8Array([1, 2, 3, 4, 5]));
    const isValid = await verifySignature(publicKey, signedData, new Uint8Array([1, 2, 3, 4, 5]));
    if (!isValid) {
        throw new SolanaError(SOLANA_ERROR__INVALID_KEYPAIR_BYTES);
    }

    return { privateKey, publicKey } as CryptoKeyPair;
}

export async function createKeyPairFromBytes_DANGEROUSLY_SKIP_VALIDATION(bytes: Uint8Array, extractable?: boolean): Promise<CryptoKeyPair> {
    if (bytes.byteLength !== 64) {
        throw new SolanaError(SOLANA_ERROR__INVALID_KEYPAIR_BYTES, { byteLength: bytes.byteLength });
    }
    const [publicKey, privateKey] = await Promise.all([
        crypto.subtle.importKey('raw', bytes.slice(32), 'Ed25519', /* extractable */ true, ['verify']),
        createPrivateKeyFromBytes(bytes.slice(0, 32), extractable),
    ]);

    return { privateKey, publicKey } as CryptoKeyPair;
}
