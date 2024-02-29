/**
 * To add a new error, follow the instructions at
 * https://github.com/solana-labs/solana-web3.js/tree/master/packages/errors/#adding-a-new-error
 *
 * WARNING:
 *   - Don't remove error codes
 *   - Don't change or reorder error codes.
 */
export const SOLANA_ERROR__RPC_INTEGER_OVERFLOW = 3 as const;
export const SOLANA_ERROR__INVALID_KEYPAIR_BYTES = 4 as const;
export const SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED = 5 as const;
export const SOLANA_ERROR__NONCE_INVALID = 6 as const;
export const SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND = 7 as const;
export const SOLANA_ERROR__ACCOUNT_NOT_FOUND = 8 as const;
export const SOLANA_ERROR__MULTIPLE_ACCOUNTS_NOT_FOUND = 9 as const;
export const SOLANA_ERROR__FAILED_TO_DECODE_ACCOUNT = 10 as const;
export const SOLANA_ERROR__EXPECTED_DECODED_ACCOUNT = 11 as const;
export const SOLANA_ERROR__NOT_ALL_ACCOUNTS_DECODED = 12 as const;
export const SOLANA_ERROR__INCORRECT_BASE58_ADDRESS_LENGTH = 13 as const;
export const SOLANA_ERROR__INCORRECT_BASE58_ADDRESS_BYTE_LENGTH = 14 as const;
export const SOLANA_ERROR__NOT_A_BASE58_ENCODED_ADDRESS = 15 as const;
export const SOLANA_ERROR__NOT_AN_ED25519_PUBLIC_KEY = 16 as const;
export const SOLANA_ERROR__MALFORMED_PROGRAM_DERIVED_ADDRESS = 17 as const;
export const SOLANA_ERROR__PROGRAM_DERIVED_ADDRESS_BUMP_SEED_OUT_OF_RANGE = 18 as const;
export const SOLANA_ERROR__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED = 19 as const;
export const SOLANA_ERROR__MAX_PDA_SEED_LENGTH_EXCEEDED = 20 as const;
export const SOLANA_ERROR__INVALID_SEEDS_POINT_ON_CURVE = 21 as const;
export const SOLANA_ERROR__COULD_NOT_FIND_VIABLE_PDA_BUMP_SEED = 22 as const;
export const SOLANA_ERROR__PROGRAM_ADDRESS_ENDS_WITH_PDA_MARKER = 23 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_MISSING = 24 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_DIGEST_MISSING = 25 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_ED25519_ALGORITHM_MISSING = 26 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_EXPORT_FUNCTION_MISSING = 27 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_GENERATE_FUNCTION_MISSING = 28 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_SIGN_FUNCTION_MISSING = 29 as const;
export const SOLANA_ERROR__SUBTLE_CRYPTO_VERIFY_FUNCTION_MISSING = 30 as const;
export const SOLANA_ERROR__CODECS_CANNOT_DECODE_EMPTY_BYTE_ARRAY = 31 as const;
export const SOLANA_ERROR__CODECS_WRONG_NUMBER_OF_BYTES = 32 as const;
export const SOLANA_ERROR__CODECS_EXPECTED_FIXED_LENGTH_GOT_VARIABLE_LENGTH = 33 as const;
export const SOLANA_ERROR__CODECS_EXPECTED_VARIABLE_LENGTH_GOT_FIXED_LENGTH = 34 as const;
export const SOLANA_ERROR__CODECS_ENCODER_DECODER_SIZE_COMPATIBILITY_MISMATCH = 35 as const;
export const SOLANA_ERROR__CODECS_FIXED_SIZE_ENCODER_DECODER_SIZE_MISMATCH = 36 as const;
export const SOLANA_ERROR__CODECS_VARIABLE_SIZE_ENCODER_DECODER_MAX_SIZE_MISMATCH = 37 as const;
export const SOLANA_ERROR__CODECS_CANNOT_REVERSE_CODEC_OF_VARIABLE_SIZE = 38 as const;
export const SOLANA_ERROR__CODECS_WRONG_NUMBER_OF_ITEMS = 39 as const;
export const SOLANA_ERROR__CODECS_ENUM_DISCRIMINATOR_OUT_OF_RANGE = 40 as const;
export const SOLANA_ERROR__CODECS_INVALID_DATA_ENUM_VARIANT = 41 as const;
export const SOLANA_ERROR__CODECS_INVALID_SCALAR_ENUM_VARIANT = 42 as const;
export const SOLANA_ERROR__CODECS_FIXED_NULLABLE_WITH_VARIABLE_SIZE_CODEC = 43 as const;
export const SOLANA_ERROR__CODECS_FIXED_NULLABLE_WITH_VARIABLE_SIZE_PREFIX = 44 as const;
export const SOLANA_ERROR__CODECS_CODEC_REQUIRES_FIXED_SIZE = 45 as const;
// Reserve error codes starting with [4615000-4615999] for the Rust enum `InstructionError`
export const SOLANA_ERROR__INSTRUCTION_ERROR_UNKNOWN = 4615000 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_GENERIC_ERROR = 4615001 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_ARGUMENT = 4615002 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_INSTRUCTION_DATA = 4615003 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_ACCOUNT_DATA = 4615004 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_DATA_TOO_SMALL = 4615005 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_INSUFFICIENT_FUNDS = 4615006 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_INCORRECT_PROGRAM_ID = 4615007 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_MISSING_REQUIRED_SIGNATURE = 4615008 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_ALREADY_INITIALIZED = 4615009 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_UNINITIALIZED_ACCOUNT = 4615010 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_UNBALANCED_INSTRUCTION = 4615011 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_MODIFIED_PROGRAM_ID = 4615012 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_EXTERNAL_ACCOUNT_LAMPORT_SPEND = 4615013 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_EXTERNAL_ACCOUNT_DATA_MODIFIED = 4615014 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_READONLY_LAMPORT_CHANGE = 4615015 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_READONLY_DATA_MODIFIED = 4615016 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_DUPLICATE_ACCOUNT_INDEX = 4615017 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_EXECUTABLE_MODIFIED = 4615018 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_RENT_EPOCH_MODIFIED = 4615019 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_NOT_ENOUGH_ACCOUNT_KEYS = 4615020 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_DATA_SIZE_CHANGED = 4615021 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_NOT_EXECUTABLE = 4615022 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_BORROW_FAILED = 4615023 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_BORROW_OUTSTANDING = 4615024 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_DUPLICATE_ACCOUNT_OUT_OF_SYNC = 4615025 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_CUSTOM = 4615026 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_ERROR = 4615027 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_EXECUTABLE_DATA_MODIFIED = 4615028 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_EXECUTABLE_LAMPORT_CHANGE = 4615029 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_EXECUTABLE_ACCOUNT_NOT_RENT_EXEMPT = 4615030 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_UNSUPPORTED_PROGRAM_ID = 4615031 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_CALL_DEPTH = 4615032 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_MISSING_ACCOUNT = 4615033 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_REENTRANCY_NOT_ALLOWED = 4615034 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_MAX_SEED_LENGTH_EXCEEDED = 4615035 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_SEEDS = 4615036 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_REALLOC = 4615037 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_COMPUTATIONAL_BUDGET_EXCEEDED = 4615038 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_PRIVILEGE_ESCALATION = 4615039 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_PROGRAM_ENVIRONMENT_SETUP_FAILURE = 4615040 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_PROGRAM_FAILED_TO_COMPLETE = 4615041 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_PROGRAM_FAILED_TO_COMPILE = 4615042 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_IMMUTABLE = 4615043 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_INCORRECT_AUTHORITY = 4615044 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_BORSH_IO_ERROR = 4615045 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_NOT_RENT_EXEMPT = 4615046 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_ACCOUNT_OWNER = 4615047 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_ARITHMETIC_OVERFLOW = 4615048 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_UNSUPPORTED_SYSVAR = 4615049 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_ILLEGAL_OWNER = 4615050 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_MAX_ACCOUNTS_DATA_ALLOCATIONS_EXCEEDED = 4615051 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_MAX_ACCOUNTS_EXCEEDED = 4615052 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_MAX_INSTRUCTION_TRACE_LENGTH_EXCEEDED = 4615053 as const;
export const SOLANA_ERROR__INSTRUCTION_ERROR_BUILTIN_PROGRAMS_MUST_CONSUME_COMPUTE_UNITS = 4615054 as const;
// Reserve transaction-related error codes in the range [5663000-5663999]
export const SOLANA_ERROR__TRANSACTION_INVOKED_PROGRAMS_CANNOT_PAY_FEES = 5663001 as const;
export const SOLANA_ERROR__TRANSACTION_INVOKED_PROGRAMS_MUST_NOT_BE_WRITABLE = 5663002 as const;
export const SOLANA_ERROR__TRANSACTION_EXPECTED_BLOCKHASH_LIFETIME = 5663003 as const;
export const SOLANA_ERROR__TRANSACTION_EXPECTED_NONCE_LIFETIME = 5663004 as const;
export const SOLANA_ERROR__TRANSACTION_VERSION_NUMBER_OUT_OF_RANGE = 5663005 as const;
export const SOLANA_ERROR__TRANSACTION_FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_CONTENTS_MISSING = 5663006 as const;
export const SOLANA_ERROR__TRANSACTION_FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_INDEX_OUT_OF_RANGE = 5663007 as const;
export const SOLANA_ERROR__TRANSACTION_FAILED_TO_DECOMPILE_INSTRUCTION_PROGRAM_ADDRESS_NOT_FOUND = 5663008 as const;
export const SOLANA_ERROR__TRANSACTION_FAILED_TO_DECOMPILE_FEE_PAYER_MISSING = 5663009 as const;
export const SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES = 5663010 as const;
export const SOLANA_ERROR__TRANSACTION_SIGNATURE_NOT_COMPUTABLE = 5663011 as const;
// Reserve error codes starting with [7050000-7050999] for the Rust enum `TransactionError`
export const SOLANA_ERROR__TRANSACTION_ERROR_UNKNOWN = 7050000 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_ACCOUNT_IN_USE = 7050001 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_ACCOUNT_LOADED_TWICE = 7050002 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_ACCOUNT_NOT_FOUND = 7050003 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_PROGRAM_ACCOUNT_NOT_FOUND = 7050004 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_INSUFFICIENT_FUNDS_FOR_FEE = 7050005 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_INVALID_ACCOUNT_FOR_FEE = 7050006 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_ALREADY_PROCESSED = 7050007 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_BLOCKHASH_NOT_FOUND = 7050008 as const;
// `InstructionError` intentionally omitted
export const SOLANA_ERROR__TRANSACTION_ERROR_CALL_CHAIN_TOO_DEEP = 7050009 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_MISSING_SIGNATURE_FOR_FEE = 7050010 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_INVALID_ACCOUNT_INDEX = 7050011 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_SIGNATURE_FAILURE = 7050012 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_INVALID_PROGRAM_FOR_EXECUTION = 7050013 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_SANITIZE_FAILURE = 7050014 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_CLUSTER_MAINTENANCE = 7050015 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_ACCOUNT_BORROW_OUTSTANDING = 7050016 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_WOULD_EXCEED_MAX_BLOCK_COST_LIMIT = 7050017 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_UNSUPPORTED_VERSION = 7050018 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_INVALID_WRITABLE_ACCOUNT = 7050019 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_WOULD_EXCEED_MAX_ACCOUNT_COST_LIMIT = 7050020 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_WOULD_EXCEED_ACCOUNT_DATA_BLOCK_LIMIT = 7050021 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_TOO_MANY_ACCOUNT_LOCKS = 7050022 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_ADDRESS_LOOKUP_TABLE_NOT_FOUND = 7050023 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_INVALID_ADDRESS_LOOKUP_TABLE_OWNER = 7050024 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_INVALID_ADDRESS_LOOKUP_TABLE_DATA = 7050025 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_INVALID_ADDRESS_LOOKUP_TABLE_INDEX = 7050026 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_INVALID_RENT_PAYING_ACCOUNT = 7050027 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_WOULD_EXCEED_MAX_VOTE_COST_LIMIT = 7050028 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_WOULD_EXCEED_ACCOUNT_DATA_TOTAL_LIMIT = 7050029 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_DUPLICATE_INSTRUCTION = 7050030 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_INSUFFICIENT_FUNDS_FOR_RENT = 7050031 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_MAX_LOADED_ACCOUNTS_DATA_SIZE_EXCEEDED = 7050032 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_INVALID_LOADED_ACCOUNTS_DATA_SIZE_LIMIT = 7050033 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_RESANITIZATION_NEEDED = 7050034 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_PROGRAM_EXECUTION_TEMPORARILY_RESTRICTED = 7050035 as const;
export const SOLANA_ERROR__TRANSACTION_ERROR_UNBALANCED_TRANSACTION = 7050036 as const;

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
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_UNKNOWN
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_GENERIC_ERROR
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_ARGUMENT
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_INSTRUCTION_DATA
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_ACCOUNT_DATA
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_DATA_TOO_SMALL
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_INSUFFICIENT_FUNDS
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_INCORRECT_PROGRAM_ID
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_MISSING_REQUIRED_SIGNATURE
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_ALREADY_INITIALIZED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_UNINITIALIZED_ACCOUNT
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_UNBALANCED_INSTRUCTION
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_MODIFIED_PROGRAM_ID
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_EXTERNAL_ACCOUNT_LAMPORT_SPEND
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_EXTERNAL_ACCOUNT_DATA_MODIFIED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_READONLY_LAMPORT_CHANGE
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_READONLY_DATA_MODIFIED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_DUPLICATE_ACCOUNT_INDEX
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_EXECUTABLE_MODIFIED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_RENT_EPOCH_MODIFIED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_NOT_ENOUGH_ACCOUNT_KEYS
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_DATA_SIZE_CHANGED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_NOT_EXECUTABLE
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_BORROW_FAILED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_BORROW_OUTSTANDING
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_DUPLICATE_ACCOUNT_OUT_OF_SYNC
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_CUSTOM
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_ERROR
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_EXECUTABLE_DATA_MODIFIED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_EXECUTABLE_LAMPORT_CHANGE
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_EXECUTABLE_ACCOUNT_NOT_RENT_EXEMPT
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_UNSUPPORTED_PROGRAM_ID
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_CALL_DEPTH
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_MISSING_ACCOUNT
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_REENTRANCY_NOT_ALLOWED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_MAX_SEED_LENGTH_EXCEEDED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_SEEDS
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_REALLOC
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_COMPUTATIONAL_BUDGET_EXCEEDED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_PRIVILEGE_ESCALATION
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_PROGRAM_ENVIRONMENT_SETUP_FAILURE
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_PROGRAM_FAILED_TO_COMPLETE
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_PROGRAM_FAILED_TO_COMPILE
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_IMMUTABLE
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_INCORRECT_AUTHORITY
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_BORSH_IO_ERROR
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_ACCOUNT_NOT_RENT_EXEMPT
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_INVALID_ACCOUNT_OWNER
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_ARITHMETIC_OVERFLOW
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_UNSUPPORTED_SYSVAR
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_ILLEGAL_OWNER
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_MAX_ACCOUNTS_DATA_ALLOCATIONS_EXCEEDED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_MAX_ACCOUNTS_EXCEEDED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_MAX_INSTRUCTION_TRACE_LENGTH_EXCEEDED
    | typeof SOLANA_ERROR__INSTRUCTION_ERROR_BUILTIN_PROGRAMS_MUST_CONSUME_COMPUTE_UNITS
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_UNKNOWN
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_ACCOUNT_IN_USE
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_ACCOUNT_LOADED_TWICE
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_ACCOUNT_NOT_FOUND
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_PROGRAM_ACCOUNT_NOT_FOUND
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_INSUFFICIENT_FUNDS_FOR_FEE
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_INVALID_ACCOUNT_FOR_FEE
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_ALREADY_PROCESSED
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_BLOCKHASH_NOT_FOUND
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_CALL_CHAIN_TOO_DEEP
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_MISSING_SIGNATURE_FOR_FEE
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_INVALID_ACCOUNT_INDEX
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_SIGNATURE_FAILURE
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_INVALID_PROGRAM_FOR_EXECUTION
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_SANITIZE_FAILURE
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_CLUSTER_MAINTENANCE
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_ACCOUNT_BORROW_OUTSTANDING
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_WOULD_EXCEED_MAX_BLOCK_COST_LIMIT
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_UNSUPPORTED_VERSION
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_INVALID_WRITABLE_ACCOUNT
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_WOULD_EXCEED_MAX_ACCOUNT_COST_LIMIT
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_WOULD_EXCEED_ACCOUNT_DATA_BLOCK_LIMIT
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_TOO_MANY_ACCOUNT_LOCKS
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_ADDRESS_LOOKUP_TABLE_NOT_FOUND
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_INVALID_ADDRESS_LOOKUP_TABLE_OWNER
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_INVALID_ADDRESS_LOOKUP_TABLE_DATA
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_INVALID_ADDRESS_LOOKUP_TABLE_INDEX
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_INVALID_RENT_PAYING_ACCOUNT
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_WOULD_EXCEED_MAX_VOTE_COST_LIMIT
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_WOULD_EXCEED_ACCOUNT_DATA_TOTAL_LIMIT
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_DUPLICATE_INSTRUCTION
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_INSUFFICIENT_FUNDS_FOR_RENT
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_MAX_LOADED_ACCOUNTS_DATA_SIZE_EXCEEDED
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_INVALID_LOADED_ACCOUNTS_DATA_SIZE_LIMIT
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_RESANITIZATION_NEEDED
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_PROGRAM_EXECUTION_TEMPORARILY_RESTRICTED
    | typeof SOLANA_ERROR__TRANSACTION_ERROR_UNBALANCED_TRANSACTION
    | typeof SOLANA_ERROR__TRANSACTION_INVOKED_PROGRAMS_CANNOT_PAY_FEES
    | typeof SOLANA_ERROR__TRANSACTION_INVOKED_PROGRAMS_MUST_NOT_BE_WRITABLE
    | typeof SOLANA_ERROR__TRANSACTION_EXPECTED_BLOCKHASH_LIFETIME
    | typeof SOLANA_ERROR__TRANSACTION_EXPECTED_NONCE_LIFETIME
    | typeof SOLANA_ERROR__TRANSACTION_VERSION_NUMBER_OUT_OF_RANGE
    | typeof SOLANA_ERROR__TRANSACTION_FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_CONTENTS_MISSING
    | typeof SOLANA_ERROR__TRANSACTION_FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_INDEX_OUT_OF_RANGE
    | typeof SOLANA_ERROR__TRANSACTION_FAILED_TO_DECOMPILE_INSTRUCTION_PROGRAM_ADDRESS_NOT_FOUND
    | typeof SOLANA_ERROR__TRANSACTION_FAILED_TO_DECOMPILE_FEE_PAYER_MISSING;