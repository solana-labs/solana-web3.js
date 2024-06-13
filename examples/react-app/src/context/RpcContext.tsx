import type { Rpc, RpcSubscriptions, SolanaRpcApiMainnet, SolanaRpcSubscriptionsApi } from '@solana/web3.js';
import { createSolanaRpc, createSolanaRpcSubscriptions, devnet } from '@solana/web3.js';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';

import { ChainContext } from './ChainContext';

export const RpcContext = createContext<{
    rpc: Rpc<SolanaRpcApiMainnet>; // Limit the API to only those methods found on Mainnet (ie. not `requestAirdrop`)
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}>({
    rpc: createSolanaRpc(devnet('https://api.devnet.solana.com')),
    rpcSubscriptions: createSolanaRpcSubscriptions(devnet('wss://api.devnet.solana.com')),
});

type Props = Readonly<{
    children: ReactNode;
}>;

export function RpcContextProvider({ children }: Props) {
    const { solanaRpcSubscriptionsUrl, solanaRpcUrl } = useContext(ChainContext);
    return (
        <RpcContext.Provider
            value={useMemo(
                () => ({
                    rpc: createSolanaRpc(solanaRpcUrl),
                    rpcSubscriptions: createSolanaRpcSubscriptions(solanaRpcSubscriptionsUrl),
                }),
                [solanaRpcSubscriptionsUrl, solanaRpcUrl],
            )}
        >
            {children}
        </RpcContext.Provider>
    );
}
