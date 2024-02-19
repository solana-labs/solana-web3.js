import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, Slot, SolanaRpcResponse, U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

type NumberOfLeaderSlots = U64UnsafeBeyond2Pow53Minus1;
type NumberOfBlocksProduced = U64UnsafeBeyond2Pow53Minus1;

type SlotRange = Readonly<{
    firstSlot: Slot;
    lastSlot: Slot;
}>;

type GetBlockProductionApiConfigBase = Readonly<{
    commitment?: Commitment;
    range?: SlotRange;
}>;

type GetBlockProductionApiResponseBase = SolanaRpcResponse<{
    range: SlotRange;
}>;

type GetBlockProductionApiResponseWithAllIdentities = Readonly<{
    value: Readonly<{
        byIdentity: Record<Address, [NumberOfLeaderSlots, NumberOfBlocksProduced]>;
    }>;
}>;

type GetBlockProductionApiResponseWithSingleIdentity<TIdentity extends string> = Readonly<{
    value: Readonly<{
        byIdentity: Readonly<{ [TAddress in TIdentity]?: [NumberOfLeaderSlots, NumberOfBlocksProduced] }>;
    }>;
}>;

export interface GetBlockProductionApi extends RpcApiMethods {
    /**
     * Returns recent block production information from the current or previous epoch.
     */
    getBlockProduction<TIdentity extends Address>(
        config: GetBlockProductionApiConfigBase &
            Readonly<{
                identity: TIdentity;
            }>,
    ): GetBlockProductionApiResponseBase & GetBlockProductionApiResponseWithSingleIdentity<TIdentity>;
    getBlockProduction(
        config?: GetBlockProductionApiConfigBase,
    ): GetBlockProductionApiResponseBase & GetBlockProductionApiResponseWithAllIdentities;
}
