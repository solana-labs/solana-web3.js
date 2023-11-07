import { Address } from '@solana/addresses';
import { AccountRole } from '@solana/instructions';

import { OrderedAccounts } from '../accounts';
import { getCompiledStaticAccounts } from '../compile-static-accounts';

let _nextMockAddress = 0;
function getMockAddress() {
    return `${_nextMockAddress++}` as Address;
}

describe('getCompiledStaticAccounts', () => {
    it('returns an array of addresses of each account in order', () => {
        const orderedAccounts = [
            { address: getMockAddress(), role: AccountRole.WRITABLE_SIGNER },
            { address: getMockAddress(), role: AccountRole.READONLY_SIGNER },
            { address: getMockAddress(), role: AccountRole.WRITABLE },
            { address: getMockAddress(), role: AccountRole.READONLY },
        ] as OrderedAccounts;
        const compiledStaticAccounts = getCompiledStaticAccounts(orderedAccounts);
        expect(compiledStaticAccounts).toEqual([
            orderedAccounts[0].address,
            orderedAccounts[1].address,
            orderedAccounts[2].address,
            orderedAccounts[3].address,
        ]);
    });
    it('omits lookup table accounts', () => {
        const orderedAccounts = [
            { address: getMockAddress(), role: AccountRole.WRITABLE_SIGNER },
            { address: getMockAddress(), role: AccountRole.READONLY_SIGNER },
            { address: getMockAddress(), role: AccountRole.WRITABLE },
            { address: getMockAddress(), role: AccountRole.READONLY },
            {
                address: getMockAddress(),
                addressIndex: 0,
                lookupTableAddress: getMockAddress(),
                role: AccountRole.WRITABLE,
            },
            {
                address: getMockAddress(),
                addressIndex: 1,
                lookupTableAddress: getMockAddress(),
                role: AccountRole.READONLY,
            },
        ] as OrderedAccounts;
        const compiledStaticAccounts = getCompiledStaticAccounts(orderedAccounts);
        expect(compiledStaticAccounts).not.toContain(orderedAccounts[4].address);
        expect(compiledStaticAccounts).not.toContain(orderedAccounts[5].address);
    });
});
