import { CompilableTransactionMessage } from '../compilable-transaction-message';
import { getAddressMapFromInstructions, getOrderedAccountsFromAddressMap } from './accounts';
import { getCompiledAddressTableLookups } from './address-table-lookups';
import { getCompiledMessageHeader } from './header';
import { getCompiledInstructions } from './instructions';
import { getCompiledLifetimeToken } from './lifetime-token';
import { getCompiledStaticAccounts } from './static-accounts';

type BaseCompiledTransactionMessage = Readonly<{
    header: ReturnType<typeof getCompiledMessageHeader>;
    instructions: ReturnType<typeof getCompiledInstructions>;
    lifetimeToken: ReturnType<typeof getCompiledLifetimeToken>;
    staticAccounts: ReturnType<typeof getCompiledStaticAccounts>;
}>;

export type CompiledTransactionMessage = LegacyCompiledTransactionMessage | VersionedCompiledTransactionMessage;

type LegacyCompiledTransactionMessage = BaseCompiledTransactionMessage &
    Readonly<{
        version: 'legacy';
    }>;

type VersionedCompiledTransactionMessage = BaseCompiledTransactionMessage &
    Readonly<{
        addressTableLookups?: ReturnType<typeof getCompiledAddressTableLookups>;
        version: number;
    }>;

export function compileTransactionMessage(
    transaction: CompilableTransactionMessage & Readonly<{ version: 'legacy' }>,
): LegacyCompiledTransactionMessage;
export function compileTransactionMessage(
    transaction: CompilableTransactionMessage,
): VersionedCompiledTransactionMessage;
export function compileTransactionMessage(transaction: CompilableTransactionMessage): CompiledTransactionMessage {
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
