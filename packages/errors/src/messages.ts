import {
    SOLANA_ERROR__CHAIN_NOT_SUPPORTED,
    SOLANA_ERROR__RPC_INTEGER_OVERFLOW,
    SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES,
    SOLANA_ERROR__TRANSACTION_SIGNATURE_NOT_COMPUTABLE,
    SOLANA_ERROR__WALLET_ACCOUNT_DOES_NOT_SUPPORT_FEATURE,
    SOLANA_ERROR__WALLET_ACCOUNT_NOT_FOUND_IN_WALLET,
    SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_CHAIN,
    SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_FEATURE,
    SOLANA_ERROR__WALLET_HAS_NO_CONNECTED_ACCOUNTS_FOR_CHAIN,
    SolanaErrorCode,
} from './codes';

/**
 * To add a new error, follow the instructions at
 * https://github.com/solana-labs/solana-web3.js/tree/master/packages/error#adding-a-new-error
 *
 * WARNING:
 *   - Don't change the meaning of an error message.
 */
export const SolanaErrorMessages: Readonly<{
    // This type makes this data structure exhaustive with respect to `SolanaErrorCode`.
    // TypeScript will fail to build this project if add an error code without a message.
    [P in SolanaErrorCode]: string;
}> = {
    [SOLANA_ERROR__CHAIN_NOT_SUPPORTED]: 'The chain `$chain` is not supported',
    [SOLANA_ERROR__RPC_INTEGER_OVERFLOW]:
        'The $argumentLabel argument to the `$methodName` RPC method$optionalPathLabel was ' +
        '`$value`. This number is unsafe for use with the Solana JSON-RPC because it exceeds ' +
        '`Number.MAX_SAFE_INTEGER`',
    [SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES]: 'Transaction is missing signatures for addresses: $addresses',
    [SOLANA_ERROR__TRANSACTION_SIGNATURE_NOT_COMPUTABLE]:
        "Could not determine this transaction's signature. Make sure that the transaction has " +
        'been signed by its fee payer.',
    [SOLANA_ERROR__WALLET_ACCOUNT_DOES_NOT_SUPPORT_FEATURE]:
        'The $featureName` feature is not supported by the account `$accountAddress` belonging to the wallet `$walletName`',
    [SOLANA_ERROR__WALLET_ACCOUNT_NOT_FOUND_IN_WALLET]:
        'No account having address `$accountAddress` could be found in the wallet `$walletName}`',
    [SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_CHAIN]:
        "The wallet '$walletName' does not support connecting to the chain `$chain`",
    [SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_FEATURE]:
        'The `$featureName` feature is not supported by the wallet `$walletName`',
    [SOLANA_ERROR__WALLET_HAS_NO_CONNECTED_ACCOUNTS_FOR_CHAIN]:
        "The wallet '$walletName' has no connected accounts for the chain `$chain`",
};
