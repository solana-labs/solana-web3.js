import type { SolanaRpcApi, SolanaRpcApiDevnet, SolanaRpcApiMainnet, SolanaRpcApiTestnet } from '@solana/rpc-api';
import type { Rpc, RpcTransport } from '@solana/rpc-spec';
import type { ClusterUrl, DevnetUrl, MainnetUrl, TestnetUrl } from '@solana/rpc-types';

export type RpcTransportDevnet = RpcTransport & { '~cluster': 'devnet' };
export type RpcTransportTestnet = RpcTransport & { '~cluster': 'testnet' };
export type RpcTransportMainnet = RpcTransport & { '~cluster': 'mainnet' };
export type RpcTransportWithCluster = RpcTransportDevnet | RpcTransportMainnet | RpcTransportTestnet;
export type RpcTransportFromClusterUrl<TClusterUrl extends ClusterUrl> = TClusterUrl extends DevnetUrl
    ? RpcTransportDevnet
    : TClusterUrl extends TestnetUrl
      ? RpcTransportTestnet
      : TClusterUrl extends MainnetUrl
        ? RpcTransportMainnet
        : RpcTransport;

export type RpcDevnet<TRpcMethods> = Rpc<TRpcMethods> & { '~cluster': 'devnet' };
export type RpcTestnet<TRpcMethods> = Rpc<TRpcMethods> & { '~cluster': 'testnet' };
export type RpcMainnet<TRpcMethods> = Rpc<TRpcMethods> & { '~cluster': 'mainnet' };
export type RpcFromTransport<TRpcMethods, TRpcTransport extends RpcTransport> = TRpcTransport extends RpcTransportDevnet
    ? RpcDevnet<TRpcMethods>
    : TRpcTransport extends RpcTransportTestnet
      ? RpcTestnet<TRpcMethods>
      : TRpcTransport extends RpcTransportMainnet
        ? RpcMainnet<TRpcMethods>
        : Rpc<TRpcMethods>;

export type SolanaRpcApiFromTransport<TTransport extends RpcTransport> = TTransport extends RpcTransportDevnet
    ? SolanaRpcApiDevnet
    : TTransport extends RpcTransportTestnet
      ? SolanaRpcApiTestnet
      : TTransport extends RpcTransportMainnet
        ? SolanaRpcApiMainnet
        : SolanaRpcApi;
