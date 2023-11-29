import { Address } from '@solana/addresses';
import { AccountRole, IInstruction } from '@solana/instructions';

import { OrderedAccounts } from '../accounts';
import { getCompiledInstructions } from '../compile-instructions';

let _nextMockAddress = 0;
function getMockAddress() {
    return `${_nextMockAddress++}` as Address;
}

describe('getCompiledInstructions', () => {
    it('compiles no account indices when are no accounts', () => {
        const compiledInstructions = getCompiledInstructions(
            [{ programAddress: getMockAddress() }],
            [] as unknown as OrderedAccounts,
        );
        expect(compiledInstructions[0]).not.toHaveProperty('accountIndices');
    });
    it('compiles no data when there is no data', () => {
        const compiledInstructions = getCompiledInstructions(
            [{ programAddress: getMockAddress() }],
            [] as unknown as OrderedAccounts,
        );
        expect(compiledInstructions[0]).not.toHaveProperty('data');
    });
    it('compiles account addresses into indices of the account addresses', () => {
        const addressAtIndex2 = getMockAddress();
        const addressAtIndex3 = getMockAddress();
        const addressAtIndex4 = getMockAddress();
        const lookupTableAddress = getMockAddress();
        const programAddressAtIndex1 = getMockAddress();
        const instructions = [
            {
                accounts: [
                    { address: addressAtIndex3, role: AccountRole.READONLY },
                    { address: addressAtIndex2, role: AccountRole.WRITABLE },
                ],
                programAddress: programAddressAtIndex1,
            },
            {
                accounts: [
                    {
                        address: addressAtIndex4,
                        addressIndex: 0,
                        lookupTableAddress,
                        role: AccountRole.WRITABLE,
                    },
                    { address: addressAtIndex2, role: AccountRole.READONLY },
                ],
                programAddress: programAddressAtIndex1,
            },
        ] as IInstruction[];
        const compiledInstructions = getCompiledInstructions(instructions, [
            { address: getMockAddress(), role: AccountRole.WRITABLE_SIGNER },
            { address: programAddressAtIndex1, role: AccountRole.READONLY },
            { address: addressAtIndex2, role: AccountRole.WRITABLE },
            { address: addressAtIndex3, role: AccountRole.READONLY },
            { address: addressAtIndex4, addressIndex: 0, lookupTableAddress, role: AccountRole.WRITABLE },
        ] as OrderedAccounts);
        expect(compiledInstructions).toHaveProperty('0.accountIndices', [3, 2]);
        expect(compiledInstructions).toHaveProperty('1.accountIndices', [4, 2]);
    });
    it('copies over the instruction data verbatim', () => {
        const expectedData = new Uint8Array([1, 2, 3]);
        const compiledInstructions = getCompiledInstructions(
            [{ data: expectedData, programAddress: getMockAddress() }],
            [] as unknown as OrderedAccounts,
        );
        expect(compiledInstructions[0]).toHaveProperty('data', expectedData);
    });
    it('compiles the program address into a program address index', () => {
        const programAddress = getMockAddress();
        const compiledInstructions = getCompiledInstructions([{ programAddress }], [
            { address: getMockAddress(), role: AccountRole.WRITABLE_SIGNER },
            { address: programAddress, role: AccountRole.READONLY },
        ] as OrderedAccounts);
        expect(compiledInstructions[0]).toHaveProperty('programAddressIndex', 1);
    });
});
