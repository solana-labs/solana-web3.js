import type { Address } from '@solana/addresses';
import type { Commitment, Slot, SolanaRpcResponse } from '@solana/rpc-types';

type NumberOfLeaderSlots = bigint;
type NumberOfBlocksProduced = bigint;

type SlotRange = Readonly<{
    firstSlot: Slot;
    lastSlot: Slot;
}>;

type GetBlockProductionApiConfigBase = Readonly<{
    commitment?: Commitment;
    range?: SlotRange;
}>;

type BlockProductionWithSingleIdentity<TIdentity extends string> = Readonly<{
    value: Readonly<{
        byIdentity: Readonly<{ [TAddress in TIdentity]?: [NumberOfLeaderSlots, NumberOfBlocksProduced] }>;
    }>;
}>;

type BlockProductionWithAllIdentities = Readonly<{
    value: Readonly<{
        byIdentity: Record<Address, [NumberOfLeaderSlots, NumberOfBlocksProduced]>;
    }>;
}>;

type GetBlockProductionApiResponse<T> = Readonly<{
    byIdentity: T;
    range: SlotRange;
}>;

export type GetBlockProductionApi = {
    /**
     * Returns recent block production information from the current or previous epoch.
     */
    getBlockProduction<TIdentity extends Address>(
        config: GetBlockProductionApiConfigBase &
            Readonly<{
                identity: TIdentity;
            }>,
    ): SolanaRpcResponse<GetBlockProductionApiResponse<BlockProductionWithSingleIdentity<TIdentity>>>;
    getBlockProduction(
        config?: GetBlockProductionApiConfigBase,
    ): SolanaRpcResponse<GetBlockProductionApiResponse<BlockProductionWithAllIdentities>>;
};
