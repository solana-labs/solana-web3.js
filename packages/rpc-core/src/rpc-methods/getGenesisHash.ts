import { Blockhash } from '@solana/transactions';

type GetGenesisHashApiResponse = Blockhash;

export interface GetGenesisHashApi {
    /**
     * Returns the genesis hash
     */
    getGenesisHash(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>
    ): GetGenesisHashApiResponse;
}
