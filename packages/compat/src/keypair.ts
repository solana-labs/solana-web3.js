import { createKeyPairFromBytes } from '@solana/keys';
import { Keypair } from '@solana/web3.js';

/**
 * Convert from a Legacy Web3 JS Keypair to a CryptoKeyPair
 * @param keypair   The Keypair to convert
 * @returns         A CryptoKeyPair
 */
export async function fromLegacyKeypair(keypair: Keypair, extractable?: boolean): Promise<CryptoKeyPair> {
    const bytes = new Uint8Array(64);
    bytes.set(keypair.secretKey);
    bytes.set(keypair.publicKey.toBytes(), /* offset */ 32);
    return await createKeyPairFromBytes(bytes, extractable);
}
