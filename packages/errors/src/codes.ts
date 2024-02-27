/**
 * To add a new error, follow the instructions at
 * https://github.com/solana-labs/solana-web3.js/tree/master/packages/errors/#adding-a-new-error
 *
 * WARNING:
 *   - Don't remove error codes
 *   - Don't change or reorder error codes.
 *
 * Good naming conventions:
 *   - Prefixing common errors — e.g. under the same package — can be a good way to namespace them. E.g. All codec-related errors start with `SOLANA_ERROR__CODECS_`.
 *   - Use consistent names — e.g. choose `PDA` or `PROGRAM_DERIVED_ADDRESS` and stick with it. Ensure your names are consistent with existing error codes. The decision might have been made for you.
 *   - Recommended prefixes and suffixes:
 *     - `MALFORMED_`: Some input was not constructed properly. E.g. `MALFORMED_BASE58_ENCODED_ADDRESS`.
 *     - `INVALID_`: Some input is invalid (other than because it was MALFORMED). E.g. `INVALID_NUMBER_OF_BYTES`.
 *     - `EXPECTED_`: Some input was different than expected, no need to specify the "GOT" part unless necessary. E.g. `EXPECTED_DECODED_ACCOUNT`.
 *     - `_CANNOT_`: Some operation cannot be performed or some input cannot be used due to some condition. E.g. `CANNOT_DECODE_EMPTY_BYTE_ARRAY` or `PDA_CANNOT_END_WITH_PDA_MARKER`.
 *     - `_MUST_BE_`: Some condition must be true. E.g. `NONCE_TRANSACTION_FIRST_INSTRUCTION_MUST_BE_ADVANCE_NONCE`.
 *     - `_FAILED_TO_`: Tried to perform some operation and failed. E.g. `FAILED_TO_DECODE_ACCOUNT`.
 *     - `_NOT_FOUND`: Some operation lead to not finding something. E.g. `ACCOUNT_NOT_FOUND`.
 *     - `_OUT_OF_RANGE`: Some value is out of range. E.g. `ENUM_DISCRIMINATOR_OUT_OF_RANGE`.
 *     - `_EXCEEDED`: Some limit was exceeded. E.g. `PDA_MAX_SEED_LENGTH_EXCEEDED`.
 *     - `_MISMATCH`: Some elements do not match. E.g. `ENCODER_DECODER_FIXED_SIZE_MISMATCH`.
 *     - `_MISSING`: Some required input is missing. E.g. `TRANSACTION_FEE_PAYER_MISSING`.
 *     - `_UNIMPLEMENTED`: Some required component is not available in the environment. E.g. `SUBTLE_CRYPTO_VERIFY_FUNCTION_UNIMPLEMENTED`.
 */
export const SOLANA_ERROR__TRANSACTION_SIGNATURES_MISSING = 1 as const;
export const SOLANA_ERROR__TRANSACTION_CANNOT_COMPUTE_SIGNATURE = 2 as const;
export const SOLANA_ERROR__RPC_INTEGER_OVERFLOW = 3 as const;
export const SOLANA_ERROR__INVALID_KEYPAIR_BYTES = 4 as const;
export const SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED = 5 as const;
export const SOLANA_ERROR__INVALID_NONCE = 6 as const;
export const SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND = 7 as const;
export const SOLANA_ERROR__ACCOUNT_NOT_FOUND = 8 as const;
export const SOLANA_ERROR__MULTIPLE_ACCOUNTS_NOT_FOUND = 9 as const;
export const SOLANA_ERROR__FAILED_TO_DECODE_ACCOUNT = 10 as const;
export const SOLANA_ERROR__EXPECTED_DECODED_ACCOUNT = 11 as const;
export const SOLANA_ERROR__EXPECTED_ALL_ACCOUNTS_TO_BE_DECODED = 12 as const;
export const SOLANA_ERROR__INVALID_BASE58_ADDRESS_LENGTH = 13 as const;
export const SOLANA_ERROR__INVALID_BASE58_ADDRESS_BYTE_LENGTH = 14 as const;
export const SOLANA_ERROR__MALFORMED_BASE58_ENCODED_ADDRESS = 15 as const;
export const SOLANA_ERROR__MALFORMED_ED25519_PUBLIC_KEY = 16 as const;
export const SOLANA_ERROR__MALFORMED_PDA = 17 as const;
export const SOLANA_ERROR__PDA_BUMP_SEED_OUT_OF_RANGE = 18 as const;
export const SOLANA_ERROR__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED = 19 as const;
export const SOLANA_ERROR__MAX_PDA_SEED_LENGTH_EXCEEDED = 20 as const;
export const SOLANA_ERROR__INVALID_SEEDS_POINT_ON_CURVE = 21 as const;
export const SOLANA_ERROR__FAILED_TO_FIND_VIABLE_PDA_BUMP_SEED = 22 as const;
export const SOLANA_ERROR__PDA_CANNOT_END_WITH_PDA_MARKER = 23 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_DISALLOWED_IN_INSECURE_CONTEXT = 24 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_DIGEST_UNIMPLEMENTED = 25 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_ED25519_ALGORITHM_UNIMPLEMENTED = 26 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_EXPORT_FUNCTION_UNIMPLEMENTED = 27 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_GENERATE_FUNCTION_UNIMPLEMENTED = 28 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_SIGN_FUNCTION_UNIMPLEMENTED = 29 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_VERIFY_FUNCTION_UNIMPLEMENTED = 30 as const;
export const SOLANA_ERROR__CODECS_CANNOT_DECODE_EMPTY_BYTE_ARRAY = 31 as const;
export const SOLANA_ERROR__CODECS_INVALID_NUMBER_OF_BYTES = 32 as const;
export const SOLANA_ERROR__CODECS_EXPECTED_FIXED_LENGTH = 33 as const;
export const SOLANA_ERROR__CODECS_EXPECTED_VARIABLE_LENGTH = 34 as const;
export const SOLANA_ERROR__CODECS_ENCODER_DECODER_SIZE_COMPATIBILITY_MISMATCH = 35 as const;
export const SOLANA_ERROR__CODECS_ENCODER_DECODER_FIXED_SIZE_MISMATCH = 36 as const;
export const SOLANA_ERROR__CODECS_ENCODER_DECODER_MAX_SIZE_MISMATCH = 37 as const;
export const SOLANA_ERROR__CODECS_CANNOT_REVERSE_VARIABLE_SIZE_CODEC = 38 as const;
export const SOLANA_ERROR__CODECS_INVALID_NUMBER_OF_ITEMS = 39 as const;
export const SOLANA_ERROR__CODECS_ENUM_DISCRIMINATOR_OUT_OF_RANGE = 40 as const;
export const SOLANA_ERROR__CODECS_INVALID_DATA_ENUM_VARIANT = 41 as const;
export const SOLANA_ERROR__CODECS_INVALID_SCALAR_ENUM_VARIANT = 42 as const;
export const SOLANA_ERROR__CODECS_FIXED_NULLABLE_CANNOT_USE_VARIABLE_SIZE_ITEM = 43 as const;
export const SOLANA_ERROR__CODECS_FIXED_NULLABLE_CANNOT_USE_VARIABLE_SIZE_PREFIX = 44 as const;
// Use SOLANA_ERROR__CODECS_EXPECTED_FIXED_LENGTH instead.
export const SOLANA_ERROR__CODECS_NUMBER_OUT_OF_RANGE = 46 as const;
export const SOLANA_ERROR__CODECS_INVALID_STRING_FOR_BASE = 47 as const;
export const SOLANA_ERROR__TRANSACTION_ADDRESS_MISSING = 48 as const;
export const SOLANA_ERROR__TRANSACTION_FEE_PAYER_MISSING = 49 as const;
export const SOLANA_ERROR__NONCE_TRANSACTION_INSTRUCTIONS_MISSING = 50 as const;
export const SOLANA_ERROR__NONCE_TRANSACTION_FIRST_INSTRUCTION_MUST_BE_ADVANCE_NONCE = 51 as const;

/**
 * A union of every Solana error code
 *
 * You might be wondering why this is not a TypeScript enum or const enum.
 *
 * One of the goals of this library is to enable people to use some or none of it without having to
 * bundle all of it.
 *
 * If we made the set of error codes an enum then anyone who imported it (even if to only use a
 * single error code) would be forced to bundle every code and its label.
 *
 * Const enums appear to solve this problem by letting the compiler inline only the codes that are
 * actually used. Unfortunately exporting ambient (const) enums from a library like `@solana/errors`
 * is not safe, for a variety of reasons covered here: https://stackoverflow.com/a/28818850
 */
export type SolanaErrorCode =
    | typeof SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES
    | typeof SOLANA_ERROR__TRANSACTION_SIGNATURE_NOT_COMPUTABLE
    | typeof SOLANA_ERROR__RPC_INTEGER_OVERFLOW
    | typeof SOLANA_ERROR__INVALID_KEYPAIR_BYTES
    | typeof SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED
    | typeof SOLANA_ERROR__NONCE_INVALID
    | typeof SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND
    | typeof SOLANA_ERROR__ACCOUNT_NOT_FOUND
    | typeof SOLANA_ERROR__MULTIPLE_ACCOUNTS_NOT_FOUND
    | typeof SOLANA_ERROR__FAILED_TO_DECODE_ACCOUNT
    | typeof SOLANA_ERROR__EXPECTED_DECODED_ACCOUNT
    | typeof SOLANA_ERROR__NOT_ALL_ACCOUNTS_DECODED
    | typeof SOLANA_ERROR__INCORRECT_BASE58_ADDRESS_LENGTH
    | typeof SOLANA_ERROR__INCORRECT_BASE58_ADDRESS_BYTE_LENGTH
    | typeof SOLANA_ERROR__NOT_A_BASE58_ENCODED_ADDRESS
    | typeof SOLANA_ERROR__NOT_AN_ED25519_PUBLIC_KEY
    | typeof SOLANA_ERROR__MALFORMED_PROGRAM_DERIVED_ADDRESS
    | typeof SOLANA_ERROR__PROGRAM_DERIVED_ADDRESS_BUMP_SEED_OUT_OF_RANGE
    | typeof SOLANA_ERROR__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED
    | typeof SOLANA_ERROR__MAX_PDA_SEED_LENGTH_EXCEEDED
    | typeof SOLANA_ERROR__INVALID_SEEDS_POINT_ON_CURVE
    | typeof SOLANA_ERROR__COULD_NOT_FIND_VIABLE_PDA_BUMP_SEED
    | typeof SOLANA_ERROR__PROGRAM_ADDRESS_ENDS_WITH_PDA_MARKER
    | typeof SOLANA_ERROR__SUBTLE_CRYPTO_MISSING
    | typeof SOLANA_ERROR__SUBTLE_CRYPTO_DIGEST_MISSING
    | typeof SOLANA_ERROR__SUBTLE_CRYPTO_ED25519_ALGORITHM_MISSING
    | typeof SOLANA_ERROR__SUBTLE_CRYPTO_EXPORT_FUNCTION_MISSING
    | typeof SOLANA_ERROR__SUBTLE_CRYPTO_GENERATE_FUNCTION_MISSING
    | typeof SOLANA_ERROR__SUBTLE_CRYPTO_SIGN_FUNCTION_MISSING
    | typeof SOLANA_ERROR__SUBTLE_CRYPTO_VERIFY_FUNCTION_MISSING
    | typeof SOLANA_ERROR__CODECS_CANNOT_DECODE_EMPTY_BYTE_ARRAY
    | typeof SOLANA_ERROR__CODECS_WRONG_NUMBER_OF_BYTES
    | typeof SOLANA_ERROR__CODECS_EXPECTED_FIXED_LENGTH_GOT_VARIABLE_LENGTH
    | typeof SOLANA_ERROR__CODECS_EXPECTED_VARIABLE_LENGTH_GOT_FIXED_LENGTH
    | typeof SOLANA_ERROR__CODECS_ENCODER_DECODER_SIZE_COMPATIBILITY_MISMATCH
    | typeof SOLANA_ERROR__CODECS_FIXED_SIZE_ENCODER_DECODER_SIZE_MISMATCH
    | typeof SOLANA_ERROR__CODECS_VARIABLE_SIZE_ENCODER_DECODER_MAX_SIZE_MISMATCH
    | typeof SOLANA_ERROR__CODECS_CANNOT_REVERSE_CODEC_OF_VARIABLE_SIZE
    | typeof SOLANA_ERROR__CODECS_WRONG_NUMBER_OF_ITEMS
    | typeof SOLANA_ERROR__CODECS_ENUM_DISCRIMINATOR_OUT_OF_RANGE
    | typeof SOLANA_ERROR__CODECS_INVALID_DATA_ENUM_VARIANT
    | typeof SOLANA_ERROR__CODECS_INVALID_SCALAR_ENUM_VARIANT
    | typeof SOLANA_ERROR__CODECS_FIXED_NULLABLE_WITH_VARIABLE_SIZE_CODEC
    | typeof SOLANA_ERROR__CODECS_FIXED_NULLABLE_WITH_VARIABLE_SIZE_PREFIX
    | typeof SOLANA_ERROR__CODECS_CODEC_REQUIRES_FIXED_SIZE
    | typeof SOLANA_ERROR__CODECS_NUMBER_OUT_OF_RANGE
    | typeof SOLANA_ERROR__CODECS_INVALID_STRING_FOR_BASE
    | typeof SOLANA_ERROR__TRANSACTION_MISSING_ADDRESS
    | typeof SOLANA_ERROR__TRANSACTION_MISSING_FEE_PAYER
    | typeof SOLANA_ERROR__TRANSACTION_INVALID_NONCE_TRANSACTION_NO_INSTRUCTIONS
    | typeof SOLANA_ERROR__TRANSACTION_INVALID_NONCE_TRANSACTION_FIRST_INSTRUCTION_NOT_ADVANCE_NONCE;
