import { assertKeyExporterIsAvailable } from '@solana/assertions';
import { SOLANA_ERROR__SUBTLE_CRYPTO__CANNOT_EXPORT_NON_EXTRACTABLE_KEY, SolanaError } from '@solana/errors';

export async function getPublicKeyFromPrivateKey(
    privateKey: CryptoKey,
    extractable: boolean = false,
): Promise<CryptoKey> {
    assertKeyExporterIsAvailable();

    if (privateKey.extractable === false) {
        throw new SolanaError(SOLANA_ERROR__SUBTLE_CRYPTO__CANNOT_EXPORT_NON_EXTRACTABLE_KEY, { key: privateKey });
    }

    // Export private key.
    const jwk = await crypto.subtle.exportKey('jwk', privateKey);

    // Import public key.
    return await crypto.subtle.importKey(
        'jwk',
        {
            crv /* curve */: 'Ed25519',
            ext /* extractable */: extractable,
            key_ops /* key operations */: ['verify'],
            kty /* key type */: 'OKP' /* octet key pair */,
            x /* public key x-coordinate */: jwk.x,
        },
        'Ed25519',
        extractable,
        ['verify'],
    );
}
