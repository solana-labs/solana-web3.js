import {
    SOLANA_ERROR__ACCOUNT_NOT_FOUND,
    SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED,
    SOLANA_ERROR__COULD_NOT_FIND_VIABLE_PDA_BUMP_SEED,
    SOLANA_ERROR__EXPECTED_DECODED_ACCOUNT,
    SOLANA_ERROR__FAILED_TO_DECODE_ACCOUNT,
    SOLANA_ERROR__INCORRECT_BASE58_ADDRESS_BYTE_LENGTH,
    SOLANA_ERROR__INCORRECT_BASE58_ADDRESS_LENGTH,
    SOLANA_ERROR__INVALID_KEYPAIR_BYTES,
    SOLANA_ERROR__INVALID_SEEDS_POINT_ON_CURVE,
    SOLANA_ERROR__MALFORMED_PROGRAM_DERIVED_ADDRESS,
    SOLANA_ERROR__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED,
    SOLANA_ERROR__MAX_PDA_SEED_LENGTH_EXCEEDED,
    SOLANA_ERROR__MULTIPLE_ACCOUNTS_NOT_FOUND,
    SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND,
    SOLANA_ERROR__NONCE_INVALID,
    SOLANA_ERROR__NOT_A_BASE58_ENCODED_ADDRESS,
    SOLANA_ERROR__NOT_ALL_ACCOUNTS_DECODED,
    SOLANA_ERROR__NOT_AN_ED25519_PUBLIC_KEY,
    SOLANA_ERROR__PROGRAM_ADDRESS_ENDS_WITH_PDA_MARKER,
    SOLANA_ERROR__PROGRAM_DERIVED_ADDRESS_BUMP_SEED_OUT_OF_RANGE,
    SOLANA_ERROR__RPC_INTEGER_OVERFLOW,
    SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES,
    SOLANA_ERROR__TRANSACTION_SIGNATURE_NOT_COMPUTABLE,
    SolanaErrorCode,
} from './codes';

/**
 * To add a new error, follow the instructions at
 * https://github.com/solana-labs/solana-web3.js/tree/master/packages/errors#adding-a-new-error
 *
 * WARNING:
 *   - Don't change the meaning of an error message.
 */
export const SolanaErrorMessages: Readonly<{
    // This type makes this data structure exhaustive with respect to `SolanaErrorCode`.
    // TypeScript will fail to build this project if add an error code without a message.
    [P in SolanaErrorCode]: string;
}> = {
    [SOLANA_ERROR__ACCOUNT_NOT_FOUND]: 'Account not found at address: $address.',
    [SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED]:
        'The network has progressed past the last block for which this transaction could have been committed.',
    [SOLANA_ERROR__COULD_NOT_FIND_VIABLE_PDA_BUMP_SEED]: 'Unable to find a viable program address bump seed.',
    [SOLANA_ERROR__EXPECTED_DECODED_ACCOUNT]: 'Expected decoded account at address: $address.',
    [SOLANA_ERROR__FAILED_TO_DECODE_ACCOUNT]: 'Failed to decode account data at address: $address.',
    [SOLANA_ERROR__INCORRECT_BASE58_ADDRESS_BYTE_LENGTH]:
        'Expected base58 encoded address to decode to a byte array of length 32. Actual length: $actualLength.',
    [SOLANA_ERROR__INCORRECT_BASE58_ADDRESS_LENGTH]:
        'Expected base58-encoded string of length between 32 and 44, got $actualLength.',
    [SOLANA_ERROR__INVALID_KEYPAIR_BYTES]: 'Key pair bytes must be of length 64, got $byteLength.',
    [SOLANA_ERROR__INVALID_SEEDS_POINT_ON_CURVE]: 'Invalid seeds; point must fall off the Ed25519 curve.',
    [SOLANA_ERROR__MALFORMED_PROGRAM_DERIVED_ADDRESS]:
        'Expected given program derived address to have the following format: [Address, ProgramDerivedAddressBump].',
    [SOLANA_ERROR__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED]:
        'A maximum of $maxSeeds seeds may be supplied when creating an address.',
    [SOLANA_ERROR__MAX_PDA_SEED_LENGTH_EXCEEDED]:
        'The seed at index $index exceeds the maximum length of $maxSeedLength bytes.',
    [SOLANA_ERROR__MULTIPLE_ACCOUNTS_NOT_FOUND]: 'Accounts not found at addresses: $addresses.',
    [SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND]: 'No nonce account could be found at address `$nonceAccountAddress`',
    [SOLANA_ERROR__NONCE_INVALID]:
        'The nonce `$expectedNonceValue` is no longer valid. It has advanced to `$actualNonceValue`',
    [SOLANA_ERROR__NOT_ALL_ACCOUNTS_DECODED]:
        'Not all accounts were decoded. Encoded accounts found at addresses: $addresses.',
    [SOLANA_ERROR__NOT_AN_ED25519_PUBLIC_KEY]: 'The `CryptoKey` must be an `Ed25519` public key',
    [SOLANA_ERROR__NOT_A_BASE58_ENCODED_ADDRESS]: '$putativeAddress is not a base58-encoded address.',
    [SOLANA_ERROR__PROGRAM_ADDRESS_ENDS_WITH_PDA_MARKER]: 'Program address cannot end with PDA marker.',
    [SOLANA_ERROR__PROGRAM_DERIVED_ADDRESS_BUMP_SEED_OUT_OF_RANGE]:
        'Expected program derived address bump to be in the range [0, 255], got: $bump.',
    [SOLANA_ERROR__RPC_INTEGER_OVERFLOW]:
        'The $argumentLabel argument to the `$methodName` RPC method$optionalPathLabel was ' +
        '`$value`. This number is unsafe for use with the Solana JSON-RPC because it exceeds ' +
        '`Number.MAX_SAFE_INTEGER`.',
    [SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES]: 'Transaction is missing signatures for addresses: $addresses.',
    [SOLANA_ERROR__TRANSACTION_SIGNATURE_NOT_COMPUTABLE]:
        "Could not determine this transaction's signature. Make sure that the transaction has " +
        'been signed by its fee payer.',
};
