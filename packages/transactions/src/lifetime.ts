import { Blockhash } from '@solana/rpc-types';
import { NewNonce } from '@solana/transaction-messages';

export type TransactionBlockhashLifetime = {
    blockhash: Blockhash;
};

export type TransactionDurableNonceLifetime = {
    nonce: NewNonce;
};

export type TransactionWithLifetime = {
    readonly lifetimeConstraint: TransactionBlockhashLifetime | TransactionDurableNonceLifetime;
};

export function isTransactionBlockhashLifetime(
    lifetime: TransactionWithLifetime['lifetimeConstraint'],
): lifetime is TransactionBlockhashLifetime {
    return 'blockhash' in lifetime;
}
