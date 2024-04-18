import { TransactionMessageWithBlockhashLifetime, TransactionMessageWithDurableNonceLifetime } from '../index';

export function getCompiledLifetimeToken(
    lifetimeConstraint: (
        | TransactionMessageWithBlockhashLifetime
        | TransactionMessageWithDurableNonceLifetime
    )['lifetimeConstraint'],
): string {
    if ('nonce' in lifetimeConstraint) {
        return lifetimeConstraint.nonce;
    }
    return lifetimeConstraint.blockhash;
}
