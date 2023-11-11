import { Address } from '@solana/addresses';
import {
    DataSlice,
    GetProgramAccountsDatasizeFilter,
    GetProgramAccountsMemcmpFilter,
    Slot,
} from '@solana/rpc-core/dist/types/rpc-methods/common';
import { Commitment } from '@solana/rpc-types';

export type ProgramAccountsQueryArgs = {
    programAddress: Address;
    commitment?: Commitment;
    dataSlice?: DataSlice;
    encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    filters: (GetProgramAccountsMemcmpFilter | GetProgramAccountsDatasizeFilter)[];
    minContextSlot?: Slot;
};
