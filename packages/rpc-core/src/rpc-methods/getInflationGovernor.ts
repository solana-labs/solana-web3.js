import { Commitment } from './common';

type GetInflationGovernorApiResponse = Readonly<{
    /** The initial inflation percentage from time 0 */
    initial: number; // Until we land on best type for `f64`
    /** Percentage of total inflation allocated to the foundation */
    foundation: number; // Until we land on best type for `f64`
    /** Duration of foundation pool inflation in years */
    foundationTerm: number; // Until we land on best type for `f64`
    /**
     * Rate per year at which inflation is lowered.
     * (Rate reduction is derived using the target
     * slot time in genesis config)
     */
    taper: number; // Until we land on best type for `f64`
    /** Terminal inflation percentage */
    terminal: number; // Until we land on best type for `f64`
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
