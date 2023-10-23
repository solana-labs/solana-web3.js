import { Commitment } from '@solana/rpc-types';

import { F64UnsafeSeeDocumentation } from './common';

type GetInflationGovernorApiResponse = Readonly<{
    /** The initial inflation percentage from time 0 */
    initial: F64UnsafeSeeDocumentation;
    /** Percentage of total inflation allocated to the foundation */
    foundation: F64UnsafeSeeDocumentation;
    /** Duration of foundation pool inflation in years */
    foundationTerm: F64UnsafeSeeDocumentation;
    /**
     * Rate per year at which inflation is lowered.
     * (Rate reduction is derived using the target
     * slot time in genesis config)
     */
    taper: F64UnsafeSeeDocumentation;
    /** Terminal inflation percentage */
    terminal: F64UnsafeSeeDocumentation;
}>;

export interface GetInflationGovernorApi {
    /**
     * Returns the current inflation governor
     */
    getInflationGovernor(
        config?: Readonly<{
            // Defaults to `finalized`
            commitment?: Commitment;
        }>
    ): GetInflationGovernorApiResponse;
}
