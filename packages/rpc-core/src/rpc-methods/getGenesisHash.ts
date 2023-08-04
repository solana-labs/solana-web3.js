import { Base58EncodedAddress } from '@solana/addresses';

type GetGenesisHashApiResponse = Base58EncodedAddress;

export interface GetGenesisHashApi {
    /**
     * Returns the genesis hash
     */
    getGenesisHash(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>
    ): GetGenesisHashApiResponse;
}
