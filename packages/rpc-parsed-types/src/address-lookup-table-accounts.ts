import type { Address } from '@solana/addresses';
import type { StringifiedBigInt } from '@solana/rpc-types';

export type JsonParsedAddressLookupTableAccount = Readonly<{
    addresses: readonly Address[];
    authority?: Address;
    deactivationSlot: StringifiedBigInt;
    lastExtendedSlot: StringifiedBigInt;
    lastExtendedSlotStartIndex: number;
}>;
