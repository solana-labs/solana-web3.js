import { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';

type GetClusterNodesNode = Readonly<{
    /** The unique identifier of the node's feature set */
    featureSet: number | null;
    /** Gossip network address for the node */
    gossip: string | null;
    /** Node public key, as base-58 encoded string */
    pubkey: Address;
    /**
     * JSON RPC network address for the node,
     * or `null` if the JSON RPC service is not enabled
     */
    rpc: string | null;
    /** The shred version the node has been configured to use */
    shredVersion: number | null;
    /** TPU network address for the node */
    tpu: string | null;
    /**
     * The software version of the node,
     * or `null` if the version information is not available
     */
    version: string | null;
}>;

type GetClusterNodesApiResponse = readonly GetClusterNodesNode[];

export interface GetClusterNodesApi extends RpcApiMethods {
    /**
     * Returns information about all the nodes participating in the cluster
     * Note that the optional NO_CONFIG object is ignored. See https://github.com/solana-labs/solana-web3.js/issues/1389
     */
    getClusterNodes(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): GetClusterNodesApiResponse;
}
