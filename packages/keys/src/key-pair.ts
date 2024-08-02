import { assertKeyGenerationIsAvailable, assertPRNGIsAvailable } from '@solana/assertions';
import { ReadonlyUint8Array } from '@solana/codecs-core';
import {
    SOLANA_ERROR__KEYS__INVALID_KEY_PAIR_BYTE_LENGTH,
    SOLANA_ERROR__KEYS__PUBLIC_KEY_MUST_MATCH_PRIVATE_KEY,
    SolanaError,
} from '@solana/errors';

import { createPrivateKeyFromBytes } from './private-key';
import { getPublicKeyFromPrivateKey } from './public-key';
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

export async function createKeyPairFromBytes(bytes: ReadonlyUint8Array, extractable?: boolean): Promise<CryptoKeyPair> {
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

export async function createKeyPairFromPrivateKeyBytes(
    bytes: ReadonlyUint8Array,
    extractable: boolean = false,
): Promise<CryptoKeyPair> {
    const privateKeyPromise = createPrivateKeyFromBytes(bytes, extractable);

    // Here we need the private key to be extractable in order to export
    // it as a public key. Therefore, if the `extractable` parameter
    // is `false`, we need to create two private keys such that:
    //   - The extractable one is used to create the public key and
    //   - The non-extractable one is the one we will return.
    const [publicKey, privateKey] = await Promise.all([
        // This nested promise makes things efficient by
        // creating the public key in parallel with the
        // second private key creation, if it is needed.
        (extractable ? privateKeyPromise : createPrivateKeyFromBytes(bytes, true /* extractable */)).then(
            async privateKey => await getPublicKeyFromPrivateKey(privateKey, true /* extractable */),
        ),
        privateKeyPromise,
    ]);

    return { privateKey, publicKey };
}
