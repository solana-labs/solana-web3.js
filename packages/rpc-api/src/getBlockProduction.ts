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

export interface GetBlockProductionApi extends RpcApiMethods {
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
}
