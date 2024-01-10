import { Address } from '@solana/addresses';
import { StringifiedBigInt } from '@solana/rpc-types';

export type AddressLookupTableAccount = Readonly<{
    addresses: readonly Address[];
    authority?: Address;
    deactivationSlot: StringifiedBigInt;
    lastExtendedSlot: StringifiedBigInt;
    lastExtendedSlotStartIndex: number;
}>;
