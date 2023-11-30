import { createPrivateKeyFromBytes } from '@solana/keys';
import { Keypair } from '@solana/web3.js';

/**
 * Convert from a Legacy Web3 JS Keypair to a CryptoKeyPair
 * @param keypair   The Keypair to convert
 * @returns         A CryptoKeyPair
 */
export async function fromLegacyKeypair(keypair: Keypair, extractable?: boolean): Promise<CryptoKeyPair> {
    const [publicKey, privateKey] = await Promise.all([
        crypto.subtle.importKey('raw', keypair.publicKey.toBytes(), 'Ed25519', true, ['verify']),
        createPrivateKeyFromBytes(keypair.secretKey.slice(0, 32), extractable),
    ]);
    return {
        privateKey,
        publicKey,
    } as CryptoKeyPair;
}
