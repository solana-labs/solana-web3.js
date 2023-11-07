import { Address } from '@solana/addresses';
import { PublicKey } from '@solana/web3.js';

/**
 * Convert from a Legacy Web3 JS PublicKey to a base58 encoded address
 * @param publicKey The PublicKey to convert
 * @returns         An Address
 */
export function fromLegacyPublicKey<TAddress extends string>(publicKey: PublicKey): Address<TAddress> {
    return publicKey.toBase58() as Address<TAddress>;
}
