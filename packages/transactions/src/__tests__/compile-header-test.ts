import { AccountRole } from '@solana/instructions';
import { Base58EncodedAddress } from '@solana/keys';

import { OrderedAccounts } from '../accounts';
import { getCompiledMessageHeader } from '../compile-header';

let _nextMockAddress = 0;
function getMockAddress() {
    return `${_nextMockAddress++}` as Base58EncodedAddress;
}

describe('getCompiledMessageHeader', () => {
    it('counts the number of signers', () => {
        expect(
            getCompiledMessageHeader([
                { address: getMockAddress(), role: AccountRole.WRITABLE_SIGNER },
                { address: getMockAddress(), role: AccountRole.READONLY_SIGNER },
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
            ] as OrderedAccounts)
        ).toHaveProperty('numSignerAccounts', 3);
    });
    it('counts the number of readonly signers', () => {
        expect(
            getCompiledMessageHeader([
                { address: getMockAddress(), role: AccountRole.WRITABLE_SIGNER },
                { address: getMockAddress(), role: AccountRole.READONLY_SIGNER },
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
            ] as OrderedAccounts)
        ).toHaveProperty('numReadonlySignerAccounts', 2);
    });
    it('counts the number of readonly non-signers, ignoring lookup table addresses', () => {
        expect(
            getCompiledMessageHeader([
                { address: getMockAddress(), role: AccountRole.WRITABLE_SIGNER },
                { address: getMockAddress(), role: AccountRole.READONLY_SIGNER },
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
            ] as OrderedAccounts)
        ).toHaveProperty('numReadonlyNonSignerAccounts', 1);
    });
});
