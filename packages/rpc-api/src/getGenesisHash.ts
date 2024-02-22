import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Blockhash } from '@solana/rpc-types';

type GetGenesisHashApiResponse = Blockhash;

export interface GetGenesisHashApi extends RpcApiMethods {
    /**
     * Returns the genesis hash
     */
    getGenesisHash(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): GetGenesisHashApiResponse;
}
