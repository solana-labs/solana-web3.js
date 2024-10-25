import type { ClusterUrl } from '@solana/web3.js';
import { devnet } from '@solana/web3.js';
import { createContext } from 'react';

export type ChainContext = Readonly<{
    chain: `solana:${string}`;
    displayName: string;
    setChain?(chain: `solana:${string}`): void;
    solanaExplorerClusterName: 'devnet' | 'mainnet-beta' | 'testnet';
    solanaRpcSubscriptionsUrl: ClusterUrl;
    solanaRpcUrl: ClusterUrl;
}>;

export const DEFAULT_CHAIN_CONFIG = Object.freeze({
    chain: 'solana:devnet',
    displayName: 'Devnet',
    solanaExplorerClusterName: 'devnet',
    solanaRpcSubscriptionsUrl: devnet('wss://api.devnet.solana.com'),
    solanaRpcUrl: devnet('https://api.devnet.solana.com'),
});

export const ChainContext = createContext<ChainContext>(DEFAULT_CHAIN_CONFIG);
