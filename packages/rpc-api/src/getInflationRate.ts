import type { F64UnsafeSeeDocumentation, U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

type GetInflationRateApiResponse = Readonly<{
    /** Epoch for which these values are valid */
    epoch: U64UnsafeBeyond2Pow53Minus1;
    /** Inflation allocated to the foundation */
    foundation: F64UnsafeSeeDocumentation;
    /** Total inflation */
    total: F64UnsafeSeeDocumentation;
    /** Inflation allocated to validators */
    validator: F64UnsafeSeeDocumentation;
}>;

export type GetInflationRateApi = {
    /**
     * Returns the current block height of the node
     */
    getInflationRate(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): GetInflationRateApiResponse;
};
