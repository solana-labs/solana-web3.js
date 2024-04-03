import {
    SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND,
    SOLANA_ERROR__ACCOUNTS__EXPECTED_ALL_ACCOUNTS_TO_BE_DECODED,
    SOLANA_ERROR__ACCOUNTS__EXPECTED_DECODED_ACCOUNT,
    SOLANA_ERROR__ACCOUNTS__FAILED_TO_DECODE_ACCOUNT,
    SOLANA_ERROR__ACCOUNTS__ONE_OR_MORE_ACCOUNTS_NOT_FOUND,
    SOLANA_ERROR__ADDRESSES__INVALID_BASE58_ENCODED_ADDRESS,
    SOLANA_ERROR__ADDRESSES__INVALID_BYTE_LENGTH,
    SOLANA_ERROR__ADDRESSES__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED,
    SOLANA_ERROR__ADDRESSES__MAX_PDA_SEED_LENGTH_EXCEEDED,
    SOLANA_ERROR__ADDRESSES__PDA_BUMP_SEED_OUT_OF_RANGE,
    SOLANA_ERROR__ADDRESSES__STRING_LENGTH_OUT_OF_RANGE,
    SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED,
    SOLANA_ERROR__BLOCKHASH_STRING_LENGTH_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__CANNOT_DECODE_EMPTY_BYTE_ARRAY,
    SOLANA_ERROR__CODECS__CANNOT_USE_LEXICAL_VALUES_AS_ENUM_DISCRIMINATORS,
    SOLANA_ERROR__CODECS__ENCODED_BYTES_MUST_NOT_INCLUDE_SENTINEL,
    SOLANA_ERROR__CODECS__ENCODER_DECODER_FIXED_SIZE_MISMATCH,
    SOLANA_ERROR__CODECS__ENCODER_DECODER_MAX_SIZE_MISMATCH,
    SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH,
    SOLANA_ERROR__CODECS__EXPECTED_ZERO_VALUE_TO_MATCH_ITEM_FIXED_SIZE,
    SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH,
    SOLANA_ERROR__CODECS__INVALID_CONSTANT,
    SOLANA_ERROR__CODECS__INVALID_DISCRIMINATED_UNION_VARIANT,
    SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT,
    SOLANA_ERROR__CODECS__INVALID_LITERAL_UNION_VARIANT,
    SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS,
    SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE,
    SOLANA_ERROR__CODECS__LITERAL_UNION_DISCRIMINATOR_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__NUMBER_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__SENTINEL_MISSING_IN_DECODED_BYTES,
    SOLANA_ERROR__CODECS__UNION_VARIANT_OUT_OF_RANGE,
    SOLANA_ERROR__INSTRUCTION__EXPECTED_TO_HAVE_ACCOUNTS,
    SOLANA_ERROR__INSTRUCTION__EXPECTED_TO_HAVE_DATA,
    SOLANA_ERROR__INSTRUCTION__PROGRAM_ID_MISMATCH,
    SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_ALREADY_INITIALIZED,
    SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_BORROW_FAILED,
    SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_BORROW_OUTSTANDING,
    SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_DATA_SIZE_CHANGED,
    SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_DATA_TOO_SMALL,
    SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_NOT_EXECUTABLE,
    SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_NOT_RENT_EXEMPT,
    SOLANA_ERROR__INSTRUCTION_ERROR__ARITHMETIC_OVERFLOW,
    SOLANA_ERROR__INSTRUCTION_ERROR__BORSH_IO_ERROR,
    SOLANA_ERROR__INSTRUCTION_ERROR__BUILTIN_PROGRAMS_MUST_CONSUME_COMPUTE_UNITS,
    SOLANA_ERROR__INSTRUCTION_ERROR__CALL_DEPTH,
    SOLANA_ERROR__INSTRUCTION_ERROR__COMPUTATIONAL_BUDGET_EXCEEDED,
    SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
    SOLANA_ERROR__INSTRUCTION_ERROR__DUPLICATE_ACCOUNT_INDEX,
    SOLANA_ERROR__INSTRUCTION_ERROR__DUPLICATE_ACCOUNT_OUT_OF_SYNC,
    SOLANA_ERROR__INSTRUCTION_ERROR__EXECUTABLE_ACCOUNT_NOT_RENT_EXEMPT,
    SOLANA_ERROR__INSTRUCTION_ERROR__EXECUTABLE_DATA_MODIFIED,
    SOLANA_ERROR__INSTRUCTION_ERROR__EXECUTABLE_LAMPORT_CHANGE,
    SOLANA_ERROR__INSTRUCTION_ERROR__EXECUTABLE_MODIFIED,
    SOLANA_ERROR__INSTRUCTION_ERROR__EXTERNAL_ACCOUNT_DATA_MODIFIED,
    SOLANA_ERROR__INSTRUCTION_ERROR__EXTERNAL_ACCOUNT_LAMPORT_SPEND,
    SOLANA_ERROR__INSTRUCTION_ERROR__GENERIC_ERROR,
    SOLANA_ERROR__INSTRUCTION_ERROR__ILLEGAL_OWNER,
    SOLANA_ERROR__INSTRUCTION_ERROR__IMMUTABLE,
    SOLANA_ERROR__INSTRUCTION_ERROR__INCORRECT_AUTHORITY,
    SOLANA_ERROR__INSTRUCTION_ERROR__INCORRECT_PROGRAM_ID,
    SOLANA_ERROR__INSTRUCTION_ERROR__INSUFFICIENT_FUNDS,
    SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_ACCOUNT_DATA,
    SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_ACCOUNT_OWNER,
    SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_ARGUMENT,
    SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_ERROR,
    SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_INSTRUCTION_DATA,
    SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_REALLOC,
    SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_SEEDS,
    SOLANA_ERROR__INSTRUCTION_ERROR__MAX_ACCOUNTS_DATA_ALLOCATIONS_EXCEEDED,
    SOLANA_ERROR__INSTRUCTION_ERROR__MAX_ACCOUNTS_EXCEEDED,
    SOLANA_ERROR__INSTRUCTION_ERROR__MAX_INSTRUCTION_TRACE_LENGTH_EXCEEDED,
    SOLANA_ERROR__INSTRUCTION_ERROR__MAX_SEED_LENGTH_EXCEEDED,
    SOLANA_ERROR__INSTRUCTION_ERROR__MISSING_ACCOUNT,
    SOLANA_ERROR__INSTRUCTION_ERROR__MISSING_REQUIRED_SIGNATURE,
    SOLANA_ERROR__INSTRUCTION_ERROR__MODIFIED_PROGRAM_ID,
    SOLANA_ERROR__INSTRUCTION_ERROR__NOT_ENOUGH_ACCOUNT_KEYS,
    SOLANA_ERROR__INSTRUCTION_ERROR__PRIVILEGE_ESCALATION,
    SOLANA_ERROR__INSTRUCTION_ERROR__PROGRAM_ENVIRONMENT_SETUP_FAILURE,
    SOLANA_ERROR__INSTRUCTION_ERROR__PROGRAM_FAILED_TO_COMPILE,
    SOLANA_ERROR__INSTRUCTION_ERROR__PROGRAM_FAILED_TO_COMPLETE,
    SOLANA_ERROR__INSTRUCTION_ERROR__READONLY_DATA_MODIFIED,
    SOLANA_ERROR__INSTRUCTION_ERROR__READONLY_LAMPORT_CHANGE,
    SOLANA_ERROR__INSTRUCTION_ERROR__REENTRANCY_NOT_ALLOWED,
    SOLANA_ERROR__INSTRUCTION_ERROR__RENT_EPOCH_MODIFIED,
    SOLANA_ERROR__INSTRUCTION_ERROR__UNBALANCED_INSTRUCTION,
    SOLANA_ERROR__INSTRUCTION_ERROR__UNINITIALIZED_ACCOUNT,
    SOLANA_ERROR__INSTRUCTION_ERROR__UNKNOWN,
    SOLANA_ERROR__INSTRUCTION_ERROR__UNSUPPORTED_PROGRAM_ID,
    SOLANA_ERROR__INSTRUCTION_ERROR__UNSUPPORTED_SYSVAR,
    SOLANA_ERROR__INVALID_BLOCKHASH_BYTE_LENGTH,
    SOLANA_ERROR__INVALID_NONCE,
    SOLANA_ERROR__INVARIANT_VIOLATION__CACHED_ABORTABLE_ITERABLE_CACHE_ENTRY_MISSING,
    SOLANA_ERROR__INVARIANT_VIOLATION__SWITCH_MUST_BE_EXHAUSTIVE,
    SOLANA_ERROR__JSON_RPC__INTERNAL_ERROR,
    SOLANA_ERROR__JSON_RPC__INVALID_PARAMS,
    SOLANA_ERROR__JSON_RPC__INVALID_REQUEST,
    SOLANA_ERROR__JSON_RPC__METHOD_NOT_FOUND,
    SOLANA_ERROR__JSON_RPC__PARSE_ERROR,
    SOLANA_ERROR__JSON_RPC__SCAN_ERROR,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_BLOCK_CLEANED_UP,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_BLOCK_NOT_AVAILABLE,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_BLOCK_STATUS_NOT_AVAILABLE_YET,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_KEY_EXCLUDED_FROM_SECONDARY_INDEX,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_LONG_TERM_STORAGE_SLOT_SKIPPED,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_NODE_UNHEALTHY,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SLOT_SKIPPED,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_PRECOMPILE_VERIFICATION_FAILURE,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION,
    SOLANA_ERROR__KEYS__INVALID_KEY_PAIR_BYTE_LENGTH,
    SOLANA_ERROR__KEYS__INVALID_PRIVATE_KEY_BYTE_LENGTH,
    SOLANA_ERROR__KEYS__INVALID_SIGNATURE_BYTE_LENGTH,
    SOLANA_ERROR__KEYS__SIGNATURE_STRING_LENGTH_OUT_OF_RANGE,
    SOLANA_ERROR__MALFORMED_BIGINT_STRING,
    SOLANA_ERROR__MALFORMED_NUMBER_STRING,
    SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND,
    SOLANA_ERROR__RPC__INTEGER_OVERFLOW,
    SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR,
    SOLANA_ERROR__RPC__TRANSPORT_HTTP_HEADER_FORBIDDEN,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CANNOT_CREATE_SUBSCRIPTION_REQUEST,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_FAILED_TO_CONNECT,
    SOLANA_ERROR__SIGNER__ADDRESS_CANNOT_HAVE_MULTIPLE_SIGNERS,
    SOLANA_ERROR__SIGNER__EXPECTED_KEY_PAIR_SIGNER,
    SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_MODIFYING_SIGNER,
    SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_PARTIAL_SIGNER,
    SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_SIGNER,
    SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_MODIFYING_SIGNER,
    SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_PARTIAL_SIGNER,
    SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_SENDING_SIGNER,
    SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_SIGNER,
    SOLANA_ERROR__TIMESTAMP_OUT_OF_RANGE,
    SOLANA_ERROR__TRANSACTION__ADDRESS_MISSING,
    SOLANA_ERROR__TRANSACTION__ADDRESSES_CANNOT_SIGN_TRANSACTION,
    SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_CONTENTS_MISSING,
    SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_INDEX_OUT_OF_RANGE,
    SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_INSTRUCTION_PROGRAM_ADDRESS_NOT_FOUND,
    SOLANA_ERROR__TRANSACTION__INVOKED_PROGRAMS_CANNOT_PAY_FEES,
    SOLANA_ERROR__TRANSACTION__INVOKED_PROGRAMS_MUST_NOT_BE_WRITABLE,
    SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
    SOLANA_ERROR__TRANSACTION__VERSION_NUMBER_OUT_OF_RANGE,
    SOLANA_ERROR__TRANSACTION_ERROR__DUPLICATE_INSTRUCTION,
    SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_RENT,
    SOLANA_ERROR__TRANSACTION_ERROR__PROGRAM_EXECUTION_TEMPORARILY_RESTRICTED,
    SOLANA_ERROR__TRANSACTION_ERROR__UNKNOWN,
    SolanaErrorCode,
} from './codes';
import { RpcSimulateTransactionResult } from './json-rpc-error';

type BasicInstructionErrorContext<T extends SolanaErrorCode> = Readonly<{ [P in T]: { index: number } }>;

type DefaultUnspecifiedErrorContextToUndefined<T> = {
    [P in SolanaErrorCode]: P extends keyof T ? T[P] : undefined;
};

type TypedArrayMutableProperties = 'copyWithin' | 'fill' | 'reverse' | 'set' | 'sort';
interface ReadonlyUint8Array extends Omit<Uint8Array, TypedArrayMutableProperties> {
    readonly [n: number]: number;
}

/**
 * To add a new error, follow the instructions at
 * https://github.com/solana-labs/solana-web3.js/tree/master/packages/errors/#adding-a-new-error
 *
 * WARNING:
 *   - Don't change or remove members of an error's context.
 */
export type SolanaErrorContext = DefaultUnspecifiedErrorContextToUndefined<
    BasicInstructionErrorContext<
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_ALREADY_INITIALIZED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_BORROW_FAILED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_BORROW_OUTSTANDING
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_DATA_SIZE_CHANGED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_DATA_TOO_SMALL
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_NOT_EXECUTABLE
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__ACCOUNT_NOT_RENT_EXEMPT
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__ARITHMETIC_OVERFLOW
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__BORSH_IO_ERROR
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__BUILTIN_PROGRAMS_MUST_CONSUME_COMPUTE_UNITS
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__CALL_DEPTH
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__COMPUTATIONAL_BUDGET_EXCEEDED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__DUPLICATE_ACCOUNT_INDEX
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__DUPLICATE_ACCOUNT_OUT_OF_SYNC
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__EXECUTABLE_ACCOUNT_NOT_RENT_EXEMPT
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__EXECUTABLE_DATA_MODIFIED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__EXECUTABLE_LAMPORT_CHANGE
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__EXECUTABLE_MODIFIED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__EXTERNAL_ACCOUNT_DATA_MODIFIED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__EXTERNAL_ACCOUNT_LAMPORT_SPEND
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__GENERIC_ERROR
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__ILLEGAL_OWNER
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__IMMUTABLE
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__INCORRECT_AUTHORITY
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__INCORRECT_PROGRAM_ID
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__INSUFFICIENT_FUNDS
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_ACCOUNT_DATA
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_ACCOUNT_OWNER
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_ARGUMENT
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_ERROR
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_INSTRUCTION_DATA
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_REALLOC
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__INVALID_SEEDS
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__MAX_ACCOUNTS_DATA_ALLOCATIONS_EXCEEDED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__MAX_ACCOUNTS_EXCEEDED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__MAX_INSTRUCTION_TRACE_LENGTH_EXCEEDED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__MAX_SEED_LENGTH_EXCEEDED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__MISSING_ACCOUNT
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__MISSING_REQUIRED_SIGNATURE
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__MODIFIED_PROGRAM_ID
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__NOT_ENOUGH_ACCOUNT_KEYS
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__PRIVILEGE_ESCALATION
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__PROGRAM_ENVIRONMENT_SETUP_FAILURE
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__PROGRAM_FAILED_TO_COMPILE
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__PROGRAM_FAILED_TO_COMPLETE
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__READONLY_DATA_MODIFIED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__READONLY_LAMPORT_CHANGE
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__REENTRANCY_NOT_ALLOWED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__RENT_EPOCH_MODIFIED
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__UNBALANCED_INSTRUCTION
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__UNINITIALIZED_ACCOUNT
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__UNKNOWN
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__UNSUPPORTED_PROGRAM_ID
        | typeof SOLANA_ERROR__INSTRUCTION_ERROR__UNSUPPORTED_SYSVAR
    > & {
        [SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND]: {
            address: string;
        };
        [SOLANA_ERROR__ACCOUNTS__EXPECTED_ALL_ACCOUNTS_TO_BE_DECODED]: {
            addresses: string[];
        };
        [SOLANA_ERROR__ACCOUNTS__EXPECTED_DECODED_ACCOUNT]: {
            address: string;
        };
        [SOLANA_ERROR__ACCOUNTS__FAILED_TO_DECODE_ACCOUNT]: {
            address: string;
        };
        [SOLANA_ERROR__ACCOUNTS__ONE_OR_MORE_ACCOUNTS_NOT_FOUND]: {
            addresses: string[];
        };
        [SOLANA_ERROR__ADDRESSES__INVALID_BASE58_ENCODED_ADDRESS]: {
            putativeAddress: string;
        };
        [SOLANA_ERROR__ADDRESSES__INVALID_BYTE_LENGTH]: {
            actualLength: number;
        };
        [SOLANA_ERROR__ADDRESSES__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED]: {
            actual: number;
            maxSeeds: number;
        };
        [SOLANA_ERROR__ADDRESSES__MAX_PDA_SEED_LENGTH_EXCEEDED]: {
            actual: number;
            index: number;
            maxSeedLength: number;
        };
        [SOLANA_ERROR__ADDRESSES__PDA_BUMP_SEED_OUT_OF_RANGE]: {
            bump: number;
        };
        [SOLANA_ERROR__ADDRESSES__STRING_LENGTH_OUT_OF_RANGE]: {
            actualLength: number;
        };
        [SOLANA_ERROR__BLOCKHASH_STRING_LENGTH_OUT_OF_RANGE]: {
            actualLength: number;
        };
        [SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED]: {
            currentBlockHeight: bigint;
            lastValidBlockHeight: bigint;
        };
        [SOLANA_ERROR__CODECS__CANNOT_DECODE_EMPTY_BYTE_ARRAY]: {
            codecDescription: string;
        };
        [SOLANA_ERROR__CODECS__CANNOT_USE_LEXICAL_VALUES_AS_ENUM_DISCRIMINATORS]: {
            stringValues: string[];
        };
        [SOLANA_ERROR__CODECS__ENCODED_BYTES_MUST_NOT_INCLUDE_SENTINEL]: {
            encodedBytes: ReadonlyUint8Array;
            hexEncodedBytes: string;
            hexSentinel: string;
            sentinel: ReadonlyUint8Array;
        };
        [SOLANA_ERROR__CODECS__ENCODER_DECODER_FIXED_SIZE_MISMATCH]: {
            decoderFixedSize: number;
            encoderFixedSize: number;
        };
        [SOLANA_ERROR__CODECS__ENCODER_DECODER_MAX_SIZE_MISMATCH]: {
            decoderMaxSize: number | undefined;
            encoderMaxSize: number | undefined;
        };
        [SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE]: {
            discriminator: bigint | number;
            formattedValidDiscriminators: string;
            validDiscriminators: number[];
        };
        [SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH]: {
            bytesLength: number;
            codecDescription: string;
        };
        [SOLANA_ERROR__CODECS__EXPECTED_ZERO_VALUE_TO_MATCH_ITEM_FIXED_SIZE]: {
            codecDescription: string;
            expectedSize: number;
            hexZeroValue: string;
            zeroValue: ReadonlyUint8Array;
        };
        [SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH]: {
            bytesLength: number;
            codecDescription: string;
            expected: number;
        };
        [SOLANA_ERROR__CODECS__INVALID_CONSTANT]: {
            constant: ReadonlyUint8Array;
            data: ReadonlyUint8Array;
            hexConstant: string;
            hexData: string;
            offset: number;
        };
        [SOLANA_ERROR__CODECS__INVALID_DISCRIMINATED_UNION_VARIANT]: {
            value: bigint | boolean | number | string | null | undefined;
            variants: readonly (bigint | boolean | number | string | null | undefined)[];
        };
        [SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT]: {
            formattedNumericalValues: string;
            numericalValues: number[];
            stringValues: string[];
            variant: number | string | symbol;
        };
        [SOLANA_ERROR__CODECS__INVALID_LITERAL_UNION_VARIANT]: {
            value: bigint | boolean | number | string | null | undefined;
            variants: readonly (bigint | boolean | number | string | null | undefined)[];
        };
        [SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS]: {
            actual: bigint | number;
            codecDescription: string;
            expected: bigint | number;
        };
        [SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE]: {
            alphabet: string;
            base: number;
            value: string;
        };
        [SOLANA_ERROR__CODECS__LITERAL_UNION_DISCRIMINATOR_OUT_OF_RANGE]: {
            discriminator: bigint | number;
            maxRange: number;
            minRange: number;
        };
        [SOLANA_ERROR__CODECS__NUMBER_OUT_OF_RANGE]: {
            codecDescription: string;
            max: bigint | number;
            min: bigint | number;
            value: bigint | number;
        };
        [SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE]: {
            bytesLength: number;
            codecDescription: string;
            offset: number;
        };
        [SOLANA_ERROR__CODECS__SENTINEL_MISSING_IN_DECODED_BYTES]: {
            decodedBytes: ReadonlyUint8Array;
            hexDecodedBytes: string;
            hexSentinel: string;
            sentinel: ReadonlyUint8Array;
        };
        [SOLANA_ERROR__CODECS__UNION_VARIANT_OUT_OF_RANGE]: {
            maxRange: number;
            minRange: number;
            variant: number;
        };
        [SOLANA_ERROR__INSTRUCTION_ERROR__BORSH_IO_ERROR]: {
            encodedData: string;
            index: number;
        };
        [SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM]: {
            code: number;
            index: number;
        };
        [SOLANA_ERROR__INSTRUCTION_ERROR__UNKNOWN]: {
            errorName: string;
            index: number;
            instructionErrorContext?: unknown;
        };
        [SOLANA_ERROR__INSTRUCTION__EXPECTED_TO_HAVE_ACCOUNTS]: {
            data?: Uint8Array;
            programAddress: string;
        };
        [SOLANA_ERROR__INSTRUCTION__EXPECTED_TO_HAVE_DATA]: {
            accountAddresses?: string[];
            programAddress: string;
        };
        [SOLANA_ERROR__INSTRUCTION__PROGRAM_ID_MISMATCH]: {
            actualProgramAddress: string;
            expectedProgramAddress: string;
        };
        [SOLANA_ERROR__INVALID_BLOCKHASH_BYTE_LENGTH]: {
            actualLength: number;
        };
        [SOLANA_ERROR__INVALID_NONCE]: {
            actualNonceValue: string;
            expectedNonceValue: string;
        };
        [SOLANA_ERROR__INVARIANT_VIOLATION__CACHED_ABORTABLE_ITERABLE_CACHE_ENTRY_MISSING]: {
            cacheKey: string;
        };
        [SOLANA_ERROR__INVARIANT_VIOLATION__SWITCH_MUST_BE_EXHAUSTIVE]: {
            unexpectedValue: unknown;
        };
        [SOLANA_ERROR__JSON_RPC__INTERNAL_ERROR]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__INVALID_PARAMS]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__INVALID_REQUEST]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__METHOD_NOT_FOUND]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__PARSE_ERROR]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__SCAN_ERROR]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__SERVER_ERROR_BLOCK_CLEANED_UP]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__SERVER_ERROR_BLOCK_NOT_AVAILABLE]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__SERVER_ERROR_BLOCK_STATUS_NOT_AVAILABLE_YET]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__SERVER_ERROR_KEY_EXCLUDED_FROM_SECONDARY_INDEX]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__SERVER_ERROR_LONG_TERM_STORAGE_SLOT_SKIPPED]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED]: {
            contextSlot: number;
        };
        [SOLANA_ERROR__JSON_RPC__SERVER_ERROR_NODE_UNHEALTHY]: {
            numSlotsBehind?: number;
        };
        [SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE]: Omit<
            RpcSimulateTransactionResult,
            'err'
        >;
        [SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SLOT_SKIPPED]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_PRECOMPILE_VERIFICATION_FAILURE]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__JSON_RPC__SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION]: {
            __serverMessage: string;
        };
        [SOLANA_ERROR__KEYS__INVALID_KEY_PAIR_BYTE_LENGTH]: {
            byteLength: number;
        };
        [SOLANA_ERROR__KEYS__INVALID_PRIVATE_KEY_BYTE_LENGTH]: {
            actualLength: number;
        };
        [SOLANA_ERROR__KEYS__INVALID_SIGNATURE_BYTE_LENGTH]: {
            actualLength: number;
        };
        [SOLANA_ERROR__KEYS__SIGNATURE_STRING_LENGTH_OUT_OF_RANGE]: {
            actualLength: number;
        };
        [SOLANA_ERROR__MALFORMED_BIGINT_STRING]: {
            value: string;
        };
        [SOLANA_ERROR__MALFORMED_NUMBER_STRING]: {
            value: string;
        };
        [SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND]: {
            nonceAccountAddress: string;
        };
        [SOLANA_ERROR__RPC_SUBSCRIPTIONS__CANNOT_CREATE_SUBSCRIPTION_REQUEST]: {
            notificationName: string;
        };
        [SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_FAILED_TO_CONNECT]: {
            errorEvent: Event;
        };
        [SOLANA_ERROR__RPC__INTEGER_OVERFLOW]: {
            argumentLabel: string;
            keyPath: readonly (number | string | symbol)[];
            methodName: string;
            optionalPathLabel: string;
            path?: string;
            value: bigint;
        };
        [SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR]: {
            message: string;
            statusCode: number;
        };
        [SOLANA_ERROR__RPC__TRANSPORT_HTTP_HEADER_FORBIDDEN]: {
            headers: string[];
        };
        [SOLANA_ERROR__SIGNER__ADDRESS_CANNOT_HAVE_MULTIPLE_SIGNERS]: {
            address: string;
        };
        [SOLANA_ERROR__SIGNER__EXPECTED_KEY_PAIR_SIGNER]: {
            address: string;
        };
        [SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_MODIFYING_SIGNER]: {
            address: string;
        };
        [SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_PARTIAL_SIGNER]: {
            address: string;
        };
        [SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_SIGNER]: {
            address: string;
        };
        [SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_MODIFYING_SIGNER]: {
            address: string;
        };
        [SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_PARTIAL_SIGNER]: {
            address: string;
        };
        [SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_SENDING_SIGNER]: {
            address: string;
        };
        [SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_SIGNER]: {
            address: string;
        };
        [SOLANA_ERROR__TIMESTAMP_OUT_OF_RANGE]: {
            value: number;
        };
        [SOLANA_ERROR__TRANSACTION_ERROR__DUPLICATE_INSTRUCTION]: {
            index: number;
        };
        [SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_RENT]: {
            accountIndex: number;
        };
        [SOLANA_ERROR__TRANSACTION_ERROR__PROGRAM_EXECUTION_TEMPORARILY_RESTRICTED]: {
            accountIndex: number;
        };
        [SOLANA_ERROR__TRANSACTION_ERROR__UNKNOWN]: {
            errorName: string;
            transactionErrorContext?: unknown;
        };
        [SOLANA_ERROR__TRANSACTION__ADDRESSES_CANNOT_SIGN_TRANSACTION]: {
            expectedAddresses: string[];
            unexpectedAddresses: string[];
        };
        [SOLANA_ERROR__TRANSACTION__ADDRESS_MISSING]: {
            index: number;
        };
        [SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_CONTENTS_MISSING]: {
            lookupTableAddresses: string[];
        };
        [SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_INDEX_OUT_OF_RANGE]: {
            highestKnownIndex: number;
            highestRequestedIndex: number;
            lookupTableAddress: string;
        };
        [SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_INSTRUCTION_PROGRAM_ADDRESS_NOT_FOUND]: {
            index: number;
        };
        [SOLANA_ERROR__TRANSACTION__INVOKED_PROGRAMS_CANNOT_PAY_FEES]: {
            programAddress: string;
        };
        [SOLANA_ERROR__TRANSACTION__INVOKED_PROGRAMS_MUST_NOT_BE_WRITABLE]: {
            programAddress: string;
        };
        [SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING]: {
            addresses: string[];
        };
        [SOLANA_ERROR__TRANSACTION__VERSION_NUMBER_OUT_OF_RANGE]: {
            actualVersion: number;
        };
    }
>;

export function decodeEncodedContext(encodedContext: string): object {
    const decodedUrlString = __NODEJS__ ? Buffer.from(encodedContext, 'base64').toString('utf8') : atob(encodedContext);
    return Object.fromEntries(new URLSearchParams(decodedUrlString).entries());
}

function encodeValue(value: unknown): string {
    if (Array.isArray(value)) {
        const commaSeparatedValues = value.map(encodeValue).join('%2C%20' /* ", " */);
        return '%5B' /* "[" */ + commaSeparatedValues + /* "]" */ '%5D';
    } else if (typeof value === 'bigint') {
        return `${value}n`;
    } else {
        return encodeURIComponent(
            String(
                value != null && Object.getPrototypeOf(value) === null
                    ? // Plain objects with no protoype don't have a `toString` method.
                      // Convert them before stringifying them.
                      { ...(value as object) }
                    : value,
            ),
        );
    }
}

function encodeObjectContextEntry([key, value]: [string, unknown]): `${typeof key}=${string}` {
    return `${key}=${encodeValue(value)}`;
}

export function encodeContextObject(context: object): string {
    const searchParamsString = Object.entries(context).map(encodeObjectContextEntry).join('&');
    return __NODEJS__ ? Buffer.from(searchParamsString, 'utf8').toString('base64') : btoa(searchParamsString);
}
