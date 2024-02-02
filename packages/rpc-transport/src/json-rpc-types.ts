import { Rpc } from '@solana/rpc-types';

import {
    IRpcTransport,
    IRpcTransportDevnet,
    IRpcTransportMainnet,
    IRpcTransportTestnet,
    IRpcTransportWithCluster,
} from './transports/transport-types';

export type RpcDevnet<TRpcMethods> = Rpc<TRpcMethods> & { '~cluster': 'devnet' };
export type RpcTestnet<TRpcMethods> = Rpc<TRpcMethods> & { '~cluster': 'testnet' };
export type RpcMainnet<TRpcMethods> = Rpc<TRpcMethods> & { '~cluster': 'mainnet' };
export type RpcFromTransport<
    TRpcMethods,
    TRpcTransport extends IRpcTransport | IRpcTransportWithCluster,
> = TRpcTransport extends IRpcTransportDevnet
    ? RpcDevnet<TRpcMethods>
    : TRpcTransport extends IRpcTransportTestnet
      ? RpcTestnet<TRpcMethods>
      : TRpcTransport extends IRpcTransportMainnet
        ? RpcMainnet<TRpcMethods>
        : Rpc<TRpcMethods>;
