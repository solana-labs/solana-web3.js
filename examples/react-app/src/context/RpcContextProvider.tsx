import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/web3.js';
import { ReactNode, useContext, useMemo } from 'react';

import { ChainContext } from './ChainContext';
import { RpcContext } from './RpcContext';

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
