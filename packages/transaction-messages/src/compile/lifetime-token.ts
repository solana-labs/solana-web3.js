import { IDurableNonceTransactionMessage, ITransactionMessageWithBlockhashLifetime } from '../index';

export function getCompiledLifetimeToken(
    lifetimeConstraint: (
        | IDurableNonceTransactionMessage
        | ITransactionMessageWithBlockhashLifetime
    )['lifetimeConstraint'],
): string {
    if ('nonce' in lifetimeConstraint) {
        return lifetimeConstraint.nonce;
    }
    return lifetimeConstraint.blockhash;
}
