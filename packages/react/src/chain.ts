import { IdentifierString } from '@wallet-standard/base';

export type ChainToCluster<TChain extends IdentifierString> = TChain extends 'solana:mainnet'
    ? 'mainnet-beta'
    : TChain extends `${string}:${infer TCluster}`
      ? TCluster
      : never;
