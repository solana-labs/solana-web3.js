import { IDurableNonceTransactionMessage, TransactionMessageWithBlockhashLifetime } from '../index';

export function getCompiledLifetimeToken(
    lifetimeConstraint: (
        | IDurableNonceTransactionMessage
        | TransactionMessageWithBlockhashLifetime
    )['lifetimeConstraint'],
): string {
    if ('nonce' in lifetimeConstraint) {
        return lifetimeConstraint.nonce;
    }
    return lifetimeConstraint.blockhash;
}
