import { Base58EncodedAddress } from '@solana/addresses';
import { Commitment } from '@solana/rpc-core';
import { DataSlice, Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';

export type AccountQueryArgs = {
    address: Base58EncodedAddress;
    commitment?: Commitment;
    dataSlice?: DataSlice;
    encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    minContextSlot?: Slot;
};
