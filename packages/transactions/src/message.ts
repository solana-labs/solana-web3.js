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

export function compileMessage(
    transaction: BaseTransaction &
        ITransactionWithFeePayer &
        (ITransactionWithBlockhashLifetime | IDurableNonceTransaction)
) {
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
