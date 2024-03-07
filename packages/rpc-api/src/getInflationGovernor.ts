import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, F64UnsafeSeeDocumentation } from '@solana/rpc-types';

type GetInflationGovernorApiResponse = Readonly<{
    /** Percentage of total inflation allocated to the foundation */
    foundation: F64UnsafeSeeDocumentation;
    /** Duration of foundation pool inflation in years */
    foundationTerm: F64UnsafeSeeDocumentation;
    /** The initial inflation percentage from time 0 */
    initial: F64UnsafeSeeDocumentation;
    /**
     * Rate per year at which inflation is lowered.
     * (Rate reduction is derived using the target
     * slot time in genesis config)
     */
    taper: F64UnsafeSeeDocumentation;
    /** Terminal inflation percentage */
    terminal: F64UnsafeSeeDocumentation;
}>;

export interface GetInflationGovernorApi extends RpcApiMethods {
    /**
     * Returns the current inflation governor
     */
    getInflationGovernor(
        config?: Readonly<{
            // Defaults to `finalized`
            commitment?: Commitment;
        }>,
    ): GetInflationGovernorApiResponse;
}
