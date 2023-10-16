import { Base58EncodedAddress } from '@solana/addresses';
import { PublicKey } from '@solana/web3.js';

/**
 * Convert from a Legacy Web3 JS PublicKey to a base58 encoded address
 * @param publicKey The PublicKey to convert
 * @returns         A Base58EncodedAddress
 */
export function fromLegacyPublicKey<TAddress extends string>(publicKey: PublicKey): Base58EncodedAddress<TAddress> {
    return publicKey.toBase58() as Base58EncodedAddress<TAddress>;
}
