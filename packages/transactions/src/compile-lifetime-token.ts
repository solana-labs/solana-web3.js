import { IDurableNonceTransaction, ITransactionWithBlockhashLifetime } from './index.js';

export function getCompiledLifetimeToken(
    lifetimeConstraint: (ITransactionWithBlockhashLifetime | IDurableNonceTransaction)['lifetimeConstraint']
): string {
    if ('nonce' in lifetimeConstraint) {
        return lifetimeConstraint.nonce;
    }
    return lifetimeConstraint.blockhash;
}
