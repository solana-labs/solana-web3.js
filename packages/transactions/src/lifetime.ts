import { Address } from '@solana/addresses';
import { Blockhash, Slot } from '@solana/rpc-types';
import { NewNonce } from '@solana/transaction-messages';

export type TransactionBlockhashLifetime = {
    blockhash: Blockhash;
    lastValidBlockHeight: Slot;
};

export type TransactionDurableNonceLifetime = {
    nonce: NewNonce;
    nonceAccountAddress: Address;
};

export type TransactionWithLifetime = {
    readonly lifetimeConstraint: TransactionBlockhashLifetime | TransactionDurableNonceLifetime;
};

export type TransactionWithBlockhashLifetime = {
    readonly lifetimeConstraint: TransactionBlockhashLifetime;
};

export type TransactionWithDurableNonceLifetime = {
    readonly lifetimeConstraint: TransactionDurableNonceLifetime;
};

export function isTransactionBlockhashLifetime(
    lifetime: TransactionWithLifetime['lifetimeConstraint'],
): lifetime is TransactionBlockhashLifetime {
    return 'blockhash' in lifetime;
}
