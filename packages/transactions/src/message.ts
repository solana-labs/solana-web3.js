import { ITransactionWithBlockhashLifetime } from './blockhash';
import { getCompiledLifetimeToken } from './compile-lifetime-token';
import { IDurableNonceTransaction } from './durable-nonce';
import { ITransactionWithFeePayer } from './fee-payer';
import { BaseTransaction } from './types';

export function compileMessage(
    transaction: BaseTransaction &
        ITransactionWithFeePayer &
        (ITransactionWithBlockhashLifetime | IDurableNonceTransaction)
) {
    return {
        lifetimeToken: getCompiledLifetimeToken(transaction.lifetimeConstraint),
    };
}
