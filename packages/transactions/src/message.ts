import { getAddressMapFromInstructions, getOrderedAccountsFromAddressMap } from './accounts';
import { ITransactionWithBlockhashLifetime } from './blockhash';
import { getCompiledMessageHeader } from './compile-header';
import { getCompiledLifetimeToken } from './compile-lifetime-token';
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
        header: getCompiledMessageHeader(orderedAccounts),
        lifetimeToken: getCompiledLifetimeToken(transaction.lifetimeConstraint),
        version: transaction.version,
    };
}
