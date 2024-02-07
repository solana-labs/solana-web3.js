import { SOLANA_ERROR__WALLET__INVALID_SOLANA_CHAIN, SolanaError } from '@solana/errors';
import { isSolanaChain, SolanaChain } from '@solana/wallet-standard-chains';
import { IdentifierString } from '@wallet-standard/base';

export type ChainToCluster<TChain extends IdentifierString> = TChain extends 'solana:mainnet'
    ? 'mainnet-beta'
    : TChain extends `${string}:${infer TCluster}`
      ? TCluster
      : never;

export function getSolanaChainFromCluster(cluster: ChainToCluster<SolanaChain>): SolanaChain {
    const chain: IdentifierString = `solana:${cluster === 'mainnet-beta' ? 'mainnet' : cluster}`;
    if (!isSolanaChain(chain)) {
        throw new SolanaError(SOLANA_ERROR__WALLET__INVALID_SOLANA_CHAIN, { chain });
    }
    return chain;
}
