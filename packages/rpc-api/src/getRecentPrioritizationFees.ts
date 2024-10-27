import type { Address } from '@solana/addresses';
import type { MicroLamports, Slot } from '@solana/rpc-types';

type RecentPrioritizationFee = Readonly<{
    /**
     * The per-compute-unit fee paid by at least one successfully
     * landed transaction, specified in increments of
     * micro-lamports (0.000001 lamports).
     */
    prioritizationFee: MicroLamports;
    /** Slot in which the fee was observed */
    slot: Slot;
}>;

type GetRecentPrioritizationFeesApiResponse = readonly RecentPrioritizationFee[];

export type GetRecentPrioritizationFeesApi = {
    /**
     * Returns the balance of the account of provided Pubkey
     */
    getRecentPrioritizationFees(
        /**
         * An array of Account addresses (up to a maximum of 128 addresses),
         * as base-58 encoded strings.
         *
         * Note: If this parameter is provided, the response will reflect
         * a fee to land a transaction locking all of the provided accounts
         * as writable.
         */
        addresses?: Address[],
    ): GetRecentPrioritizationFeesApiResponse;
};
