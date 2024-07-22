import { Address } from '@solana/addresses';
import { AccountRole, IAccountLookupMeta, IInstruction, isSignerRole } from '@solana/instructions';

import { AddressesByLookupTableAddress } from './addresses-by-lookup-table-address';
import { TransactionMessage } from './transaction-message';

type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};

// Look up the address in lookup tables, return a lookup meta if it is found in any of them
function findAddressInLookupTables(
    address: Address,
    role: AccountRole.READONLY | AccountRole.WRITABLE,
    addressesByLookupTableAddress: AddressesByLookupTableAddress,
): IAccountLookupMeta | undefined {
    for (const [lookupTableAddress, addresses] of Object.entries(addressesByLookupTableAddress)) {
        for (let i = 0; i < addresses.length; i++) {
            if (address === addresses[i]) {
                return {
                    address,
                    addressIndex: i,
                    lookupTableAddress: lookupTableAddress as Address,
                    role,
                };
            }
        }
    }
}

type TransactionMessageNotLegacy = Exclude<TransactionMessage, { version: 'legacy' }>;

export function compressTransactionMessageUsingAddressLookupTables<
    TTransactionMessage extends TransactionMessageNotLegacy = TransactionMessageNotLegacy,
>(
    transactionMessage: TTransactionMessage,
    addressesByLookupTableAddress: AddressesByLookupTableAddress,
): TTransactionMessage {
    const lookupTableAddresses = new Set(Object.values(addressesByLookupTableAddress).flatMap(a => a));

    const newInstructions: IInstruction[] = [];
    let updatedAnyInstructions = false;
    for (const instruction of transactionMessage.instructions) {
        if (!instruction.accounts) {
            newInstructions.push(instruction);
            continue;
        }

        const newAccounts: Mutable<NonNullable<IInstruction['accounts']>> = [];
        let updatedAnyAccounts = false;
        for (const account of instruction.accounts) {
            // If the address is already a lookup, is not in any lookup tables, or is a signer role, return as-is
            if (
                'lookupTableAddress' in account ||
                !lookupTableAddresses.has(account.address) ||
                isSignerRole(account.role)
            ) {
                newAccounts.push(account);
                continue;
            }

            // We already checked it's in one of the lookup tables
            const lookupMetaAccount = findAddressInLookupTables(
                account.address,
                account.role,
                addressesByLookupTableAddress,
            )!;
            newAccounts.push(Object.freeze(lookupMetaAccount));
            updatedAnyAccounts = true;
            updatedAnyInstructions = true;
        }

        newInstructions.push(
            Object.freeze(updatedAnyAccounts ? { ...instruction, accounts: newAccounts } : instruction),
        );
    }

    return Object.freeze(
        updatedAnyInstructions ? { ...transactionMessage, instructions: newInstructions } : transactionMessage,
    );
}
