import { Base58EncodedAddress } from '@solana/addresses';

import { Commitment, RpcResponse, U64UnsafeBeyond2Pow53Minus1 } from './common';

type NumberOfLeaderSlots = U64UnsafeBeyond2Pow53Minus1;
type NumberOfBlocksProduced = U64UnsafeBeyond2Pow53Minus1;

type SlotRange = Readonly<{
    firstSlot: U64UnsafeBeyond2Pow53Minus1;
    lastSlot: U64UnsafeBeyond2Pow53Minus1;
}>;

type GetBlockProductionApiConfigBase = Readonly<{
    commitment?: Commitment;
    range?: SlotRange;
}>;

type GetBlockProductionApiResponseBase = RpcResponse<{
    range: SlotRange;
}>;

type GetBlockProductionApiResponseWithAllIdentities = Readonly<{
    value: Readonly<{
        byIdentity: Record<Base58EncodedAddress, [NumberOfLeaderSlots, NumberOfBlocksProduced]>;
    }>;
}>;

type GetBlockProductionApiResponseWithSingleIdentity<TIdentity extends string> = Readonly<{
    value: Readonly<{
        byIdentity: Readonly<{ [TAddress in TIdentity]?: [NumberOfLeaderSlots, NumberOfBlocksProduced] }>;
    }>;
}>;

export interface GetBlockProductionApi {
    /**
     * Returns recent block production information from the current or previous epoch.
     */
    getBlockProduction<TIdentity extends Base58EncodedAddress>(
        config: GetBlockProductionApiConfigBase &
            Readonly<{
                identity: TIdentity;
            }>
    ): GetBlockProductionApiResponseBase & GetBlockProductionApiResponseWithSingleIdentity<TIdentity>;
    getBlockProduction(
        config?: GetBlockProductionApiConfigBase
    ): GetBlockProductionApiResponseBase & GetBlockProductionApiResponseWithAllIdentities;
}
