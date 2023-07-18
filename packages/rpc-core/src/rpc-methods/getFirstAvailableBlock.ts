import { Slot } from './common';

type GetFirstAvailableBlockApiResponse = Slot;

export interface GetFirstAvailableBlockApi {
    /**
     * Returns the slot of the lowest confirmed block that has not been purged from the ledger
     * Note that the optional NO_CONFIG object is ignored. See https://github.com/solana-labs/solana-web3.js/issues/1389
     */
    getFirstAvailableBlock(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>
    ): GetFirstAvailableBlockApiResponse;
}
