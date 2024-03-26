import {
    SOLANA_ERROR__CHAIN_NOT_SUPPORTED,
    SOLANA_ERROR__RPC_INTEGER_OVERFLOW,
    SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES,
    SOLANA_ERROR__WALLET_ACCOUNT_DOES_NOT_SUPPORT_FEATURE,
    SOLANA_ERROR__WALLET_ACCOUNT_NOT_FOUND_IN_WALLET,
    SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_CHAIN,
    SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_FEATURE,
    SOLANA_ERROR__WALLET_HAS_NO_CONNECTED_ACCOUNTS_FOR_CHAIN,
    SolanaErrorCode,
} from './codes';

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
    [SOLANA_ERROR__CHAIN_NOT_SUPPORTED]: {
        chain: `${string}:${string}`;
    };
    [SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES]: {
        addresses: string[];
    };
    [SOLANA_ERROR__RPC_INTEGER_OVERFLOW]: {
        argumentLabel: string;
        keyPath: readonly (string | number | symbol)[];
        methodName: string;
        optionalPathLabel: string;
        path?: string;
        value: bigint;
    };
    [SOLANA_ERROR__WALLET_ACCOUNT_DOES_NOT_SUPPORT_FEATURE]: {
        accountAddress: string;
        featureNames: readonly `${string}:${string}`[];
    };
    [SOLANA_ERROR__WALLET_ACCOUNT_NOT_FOUND_IN_WALLET]: {
        accountAddress: string;
        walletName: string;
    };
    [SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_CHAIN]: {
        chain: `${string}:${string}`;
        walletName: string;
    };
    [SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_FEATURE]: {
        featureNames: readonly `${string}:${string}`[];
        walletName: string;
    };
    [SOLANA_ERROR__WALLET_HAS_NO_CONNECTED_ACCOUNTS_FOR_CHAIN]: {
        chain: `${string}:${string}`;
        walletName: string;
    };
}>;
