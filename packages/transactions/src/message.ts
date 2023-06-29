import { getAddressMapFromInstructions, getOrderedAccountsFromAddressMap } from './accounts';
import { ITransactionWithBlockhashLifetime } from './blockhash';
import { getCompiledAddressTableLookups } from './compile-address-table-lookups';
import { getCompiledMessageHeader } from './compile-header';
import { getCompiledInstructions } from './compile-instructions';
import { getCompiledLifetimeToken } from './compile-lifetime-token';
import { getCompiledStaticAccounts } from './compile-static-accounts';
import { IDurableNonceTransaction } from './durable-nonce';
import { ITransactionWithFeePayer } from './fee-payer';
import { BaseTransaction } from './types';

type BaseCompiledMessage = Readonly<{
    header: ReturnType<typeof getCompiledMessageHeader>;
    instructions: ReturnType<typeof getCompiledInstructions>;
    lifetimeToken: ReturnType<typeof getCompiledLifetimeToken>;
    staticAccounts: ReturnType<typeof getCompiledStaticAccounts>;
}>;

type CompilableTransaction = BaseTransaction &
    ITransactionWithFeePayer &
    (ITransactionWithBlockhashLifetime | IDurableNonceTransaction);

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
    transaction: CompilableTransaction & Readonly<{ version: 'legacy' }>
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
