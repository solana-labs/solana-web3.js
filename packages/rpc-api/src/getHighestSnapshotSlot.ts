import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Slot } from '@solana/rpc-types';

type GetHighestSnapshotSlotApiResponse = Readonly<{
    full: Slot;
    incremental: Slot | null;
}>;

export interface GetHighestSnapshotSlotApi extends RpcApiMethods {
    /**
     * Returns the highest slot information that the node has snapshots for.
     *
     * This will find the highest full snapshot slot, and the highest
     * incremental snapshot slot based on the full snapshot slot, if there
     * is one.
     */
    getHighestSnapshotSlot(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): GetHighestSnapshotSlotApiResponse;
}
