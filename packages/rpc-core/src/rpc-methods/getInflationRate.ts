import { U64UnsafeBeyond2Pow53Minus1 } from './common';

type GetInflationRateApiResponse = Readonly<{
    /** Epoch for which these values are valid */
    epoch: U64UnsafeBeyond2Pow53Minus1;
    /** Inflation allocated to the foundation */
    foundation: number; // Until we land on best type for `f64`
    /** Total inflation */
    total: number; // Until we land on best type for `f64`
    /** Inflation allocated to validators */
    validator: number; // Until we land on best type for `f64`
}>;

export interface GetInflationRateApi {
    /**
     * Returns the current block height of the node
     */
    getInflationRate(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>
    ): GetInflationRateApiResponse;
}
