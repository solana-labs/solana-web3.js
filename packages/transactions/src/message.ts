import { getAddressMapFromInstructions, getOrderedAccountsFromAddressMap } from './accounts.js';
import { CompilableTransaction } from './compilable-transaction.js';
import { getCompiledAddressTableLookups } from './compile-address-table-lookups.js';
import { getCompiledMessageHeader } from './compile-header.js';
import { getCompiledInstructions } from './compile-instructions.js';
import { getCompiledLifetimeToken } from './compile-lifetime-token.js';
import { getCompiledStaticAccounts } from './compile-static-accounts.js';

type BaseCompiledMessage = Readonly<{
    header: ReturnType<typeof getCompiledMessageHeader>;
    instructions: ReturnType<typeof getCompiledInstructions>;
    lifetimeToken: ReturnType<typeof getCompiledLifetimeToken>;
    staticAccounts: ReturnType<typeof getCompiledStaticAccounts>;
}>;

export type CompiledMessage = LegacyCompiledMessage | VersionedCompiledMessage;

type LegacyCompiledMessage = BaseCompiledMessage &
    Readonly<{
        version: 'legacy';
    }>;

type VersionedCompiledMessage = BaseCompiledMessage &
    Readonly<{
        addressTableLookups?: ReturnType<typeof getCompiledAddressTableLookups>;
        version: number;
    }>;

export function compileMessage(
    transaction: CompilableTransaction & Readonly<{ version: 'legacy' }>,
): LegacyCompiledMessage;
export function compileMessage(transaction: CompilableTransaction): VersionedCompiledMessage;
export function compileMessage(transaction: CompilableTransaction): CompiledMessage {
    const addressMap = getAddressMapFromInstructions(transaction.feePayer, transaction.instructions);
    const orderedAccounts = getOrderedAccountsFromAddressMap(addressMap);
    return {
        ...(transaction.version !== 'legacy'
            ? { addressTableLookups: getCompiledAddressTableLookups(orderedAccounts) }
            : null),
        header: getCompiledMessageHeader(orderedAccounts),
        instructions: getCompiledInstructions(transaction.instructions, orderedAccounts),
        lifetimeToken: getCompiledLifetimeToken(transaction.lifetimeConstraint),
        staticAccounts: getCompiledStaticAccounts(orderedAccounts),
        version: transaction.version,
    };
}
