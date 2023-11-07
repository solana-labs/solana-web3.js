import { Address, getAddressComparator } from '@solana/addresses';
import { AccountRole } from '@solana/instructions';

import { OrderedAccounts } from './accounts';

type AddressTableLookup = Readonly<{
    lookupTableAddress: Address;
    readableIndices: readonly number[];
    writableIndices: readonly number[];
}>;

export function getCompiledAddressTableLookups(orderedAccounts: OrderedAccounts): AddressTableLookup[] {
    const index: Record<Address, { readonly readableIndices: number[]; readonly writableIndices: number[] }> = {};
    for (const account of orderedAccounts) {
        if (!('lookupTableAddress' in account)) {
            continue;
        }
        const entry = (index[account.lookupTableAddress] ||= {
            readableIndices: [],
            writableIndices: [],
        });
        if (account.role === AccountRole.WRITABLE) {
            entry.writableIndices.push(account.addressIndex);
        } else {
            entry.readableIndices.push(account.addressIndex);
        }
    }
    return Object.keys(index)
        .sort(getAddressComparator())
        .map(lookupTableAddress => ({
            lookupTableAddress: lookupTableAddress as Address,
            ...index[lookupTableAddress as unknown as Address],
        }));
}
