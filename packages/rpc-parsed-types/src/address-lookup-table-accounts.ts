import type { Address } from '@solana/addresses';
import type { StringifiedBigInt } from '@solana/rpc-types';

import { RpcParsedInfo } from './rpc-parsed-type';

export type JsonParsedAddressLookupTableAccount = RpcParsedInfo<{
    addresses: readonly Address[];
    authority?: Address;
    deactivationSlot: StringifiedBigInt;
    lastExtendedSlot: StringifiedBigInt;
    lastExtendedSlotStartIndex: number;
}>;
