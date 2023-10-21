import { Blockhash } from '@solana/transactions';

type GetGenesisHashApiResponse = Blockhash;

export interface GetGenesisHashApi {
    /**
     * Returns the genesis hash
     */
    getGenesisHash(): GetGenesisHashApiResponse;
}
