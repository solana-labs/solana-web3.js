import { IDurableNonceTransaction, ITransactionWithBlockhashLifetime } from './index';

export function getCompiledLifetimeToken(
    lifetimeConstraint: (IDurableNonceTransaction | ITransactionWithBlockhashLifetime)['lifetimeConstraint'],
): string {
    if ('nonce' in lifetimeConstraint) {
        return lifetimeConstraint.nonce;
    }
    return lifetimeConstraint.blockhash;
}
