import type { RpcApiMethods } from '@solana/rpc-spec';

type GetVersionApiResponse = Readonly<{
    /** Unique identifier of the current software's feature set */
    'feature-set': number; // `u32`
    /** Software version of `solana-core` */
    'solana-core': string;
}>;

export interface GetVersionApi extends RpcApiMethods {
    /**
     * Returns the current Solana version running on the node
     */
    getVersion(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): GetVersionApiResponse;
}
