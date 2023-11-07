import { Address, getAddressComparator } from '@solana/addresses';
import { AccountRole } from '@solana/instructions';

import { OrderedAccounts } from '../accounts';
import { getCompiledAddressTableLookups } from '../compile-address-table-lookups';

const MOCK_ADDRESSES: ReadonlyArray<Address> = [
    'BRwZRKsvKkG45g59269qZ5e8UaECFim5Qfxex44UKwDG',
    'AZE3mXbzNp8SfZYBfL4L67ejQ8zmatAKKezUdCarKnUL',
    'Awft9caFzun5FcVTaXJAkAYDBgbEDF5QALeaqeY3M3Va',
    'ARc8zz6T14LZQTpjryhBGDuNZb3YmNT9PtEuBSuVM5xo',
    '6Tu9wk1r9yGwzd3xdrVzDttmkTN98iiffq7L25JKTvwh',
    '4R6dgeBbwPjnTSN78KGxhB78oFsxaobiwBsCBLAyauqA',
] as Address[];

let _nextMockAddress = 0;
function getMockAddress() {
    return `${_nextMockAddress++}` as Address;
}

describe('getCompiledAddressTableLookups', () => {
    it('returns address table lookups in lexical order', () => {
        const sortedAddresses = [...MOCK_ADDRESSES].sort(getAddressComparator());
        const orderedAccounts = [
            {
                address: getMockAddress(),
                addressIndex: 10,
                lookupTableAddress: sortedAddresses[1],
                role: AccountRole.WRITABLE,
            },
            {
                address: getMockAddress(),
                addressIndex: 20,
                lookupTableAddress: sortedAddresses[2],
                role: AccountRole.WRITABLE,
            },
            {
                address: getMockAddress(),
                addressIndex: 30,
                lookupTableAddress: sortedAddresses[0],
                role: AccountRole.READONLY,
            },
            {
                address: getMockAddress(),
                addressIndex: 40,
                lookupTableAddress: sortedAddresses[3],
                role: AccountRole.READONLY,
            },
            {
                address: getMockAddress(),
                addressIndex: 50,
                lookupTableAddress: sortedAddresses[2],
                role: AccountRole.READONLY,
            },
        ] as OrderedAccounts;
        const compiledAddressTableLookups = getCompiledAddressTableLookups(orderedAccounts);
        expect(compiledAddressTableLookups).toHaveProperty('0.lookupTableAddress', sortedAddresses[0]);
        expect(compiledAddressTableLookups).toHaveProperty('1.lookupTableAddress', sortedAddresses[1]);
        expect(compiledAddressTableLookups).toHaveProperty('2.lookupTableAddress', sortedAddresses[2]);
        expect(compiledAddressTableLookups).toHaveProperty('3.lookupTableAddress', sortedAddresses[3]);
    });
    it('populates readable/writable address indices in order', () => {
        const lookupTableAddress = getMockAddress();
        const orderedAccounts = [
            {
                address: getMockAddress(),
                addressIndex: 20,
                lookupTableAddress,
                role: AccountRole.WRITABLE,
            },
            {
                address: getMockAddress(),
                addressIndex: 10,
                lookupTableAddress,
                role: AccountRole.WRITABLE,
            },
            {
                address: getMockAddress(),
                addressIndex: 30,
                lookupTableAddress,
                role: AccountRole.READONLY,
            },
            {
                address: getMockAddress(),
                addressIndex: 50,
                lookupTableAddress,
                role: AccountRole.READONLY,
            },
            {
                address: getMockAddress(),
                addressIndex: 40,
                lookupTableAddress,
                role: AccountRole.READONLY,
            },
        ] as OrderedAccounts;
        const compiledAddressTableLookups = getCompiledAddressTableLookups(orderedAccounts);
        expect(compiledAddressTableLookups).toHaveProperty('0.readableIndices', [30, 50, 40]);
        expect(compiledAddressTableLookups).toHaveProperty('0.writableIndices', [20, 10]);
    });
});
