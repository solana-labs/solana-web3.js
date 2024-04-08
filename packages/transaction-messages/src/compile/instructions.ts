import { Address } from '@solana/addresses';
import { IInstruction } from '@solana/instructions';

import { OrderedAccounts } from './accounts';

type CompiledInstruction = Readonly<{
    accountIndices?: number[];
    data?: Uint8Array;
    programAddressIndex: number;
}>;

function getAccountIndex(orderedAccounts: OrderedAccounts) {
    const out: Record<Address, number> = {};
    for (const [index, account] of orderedAccounts.entries()) {
        out[account.address] = index;
    }
    return out;
}

export function getCompiledInstructions(
    instructions: readonly IInstruction[],
    orderedAccounts: OrderedAccounts,
): CompiledInstruction[] {
    const accountIndex = getAccountIndex(orderedAccounts);
    return instructions.map(({ accounts, data, programAddress }) => {
        return {
            programAddressIndex: accountIndex[programAddress],
            ...(accounts ? { accountIndices: accounts.map(({ address }) => accountIndex[address]) } : null),
            ...(data ? { data } : null),
        };
    });
}
