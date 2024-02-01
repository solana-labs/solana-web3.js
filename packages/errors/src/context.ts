import { SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES, SolanaErrorCode } from './codes';

export type DefaultUnspecifiedErrorContextToUndefined<T> = {
    [P in SolanaErrorCode]: P extends keyof T ? T[P] : undefined;
};

/**
 * To add a new error, follow the instructions at
 * https://github.com/solana-labs/solana-web3.js/tree/master/packages/error#adding-a-new-error
 *
 * WARNING:
 *   - Don't change or remove members of an error's context.
 */
export type SolanaErrorContext = DefaultUnspecifiedErrorContextToUndefined<{
    [SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES]: {
        addresses: string[];
    };
}>;
