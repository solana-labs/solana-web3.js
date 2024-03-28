import { getAddressMapFromInstructions, getOrderedAccountsFromAddressMap } from './accounts';
import { CompilableTransaction } from './compilable-transaction';
import { getCompiledAddressTableLookups } from './compile-address-table-lookups';
import { getCompiledMessageHeader } from './compile-header';
import { getCompiledInstructions } from './compile-instructions';
import { getCompiledLifetimeToken } from './compile-lifetime-token';
import { getCompiledStaticAccounts } from './compile-static-accounts';

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

export function compileTransactionMessage(
    transaction: CompilableTransaction & Readonly<{ version: 'legacy' }>,
): LegacyCompiledMessage;
export function compileTransactionMessage(transaction: CompilableTransaction): VersionedCompiledMessage;
export function compileTransactionMessage(transaction: CompilableTransaction): CompiledMessage {
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
