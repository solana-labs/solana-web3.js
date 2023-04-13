import { Base58EncodedAddress } from '@solana/keys';
import { Commitment, RpcResponse, U64UnsafeBeyond2Pow53Minus1 } from './common';

type NumberOfLeaderSlots = number;
type NumberOfBlocksProduced = number;

type Range = Readonly<{
    firstSlot: U64UnsafeBeyond2Pow53Minus1;
    lastSlot: U64UnsafeBeyond2Pow53Minus1;
}>;

type GetBlockProductionApiResponse = RpcResponse<{
    byIdentity: Readonly<{
        [address: string]: [NumberOfLeaderSlots, NumberOfBlocksProduced];
    }>;
    range: Range;
}>;

export interface GetBlockProductionApi {
    /**
     * Returns recent block production information from the current or previous epoch.
     */
    getBlockProduction(
        config?: Readonly<{
            commitment?: Commitment;
            identity?: Base58EncodedAddress;
            range?: Range;
        }>
    ): GetBlockProductionApiResponse;
}
