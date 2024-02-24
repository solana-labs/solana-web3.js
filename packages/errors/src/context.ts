import {
    SOLANA_ERROR__ACCOUNT_NOT_FOUND,
    SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED,
    SOLANA_ERROR__CODECS_CANNOT_DECODE_EMPTY_BYTE_ARRAY,
    SOLANA_ERROR__CODECS_FIXED_SIZE_ENCODER_DECODER_SIZE_MISMATCH,
    SOLANA_ERROR__CODECS_VARIABLE_SIZE_ENCODER_DECODER_MAX_SIZE_MISMATCH,
    SOLANA_ERROR__CODECS_WRONG_NUMBER_OF_BYTES,
    SOLANA_ERROR__EXPECTED_DECODED_ACCOUNT,
    SOLANA_ERROR__FAILED_TO_DECODE_ACCOUNT,
    SOLANA_ERROR__INCORRECT_BASE58_ADDRESS_BYTE_LENGTH,
    SOLANA_ERROR__INCORRECT_BASE58_ADDRESS_LENGTH,
    SOLANA_ERROR__INVALID_KEYPAIR_BYTES,
    SOLANA_ERROR__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED,
    SOLANA_ERROR__MAX_PDA_SEED_LENGTH_EXCEEDED,
    SOLANA_ERROR__MULTIPLE_ACCOUNTS_NOT_FOUND,
    SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND,
    SOLANA_ERROR__NONCE_INVALID,
    SOLANA_ERROR__NOT_A_BASE58_ENCODED_ADDRESS,
    SOLANA_ERROR__NOT_ALL_ACCOUNTS_DECODED,
    SOLANA_ERROR__PROGRAM_DERIVED_ADDRESS_BUMP_SEED_OUT_OF_RANGE,
    SOLANA_ERROR__RPC_INTEGER_OVERFLOW,
    SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES,
    SolanaErrorCode,
} from './codes';

export type DefaultUnspecifiedErrorContextToUndefined<T> = {
    [P in SolanaErrorCode]: P extends keyof T ? T[P] : undefined;
};

/**
 * To add a new error, follow the instructions at
 * https://github.com/solana-labs/solana-web3.js/tree/master/packages/errors/#adding-a-new-error
 *
 * WARNING:
 *   - Don't change or remove members of an error's context.
 */
export type SolanaErrorContext = DefaultUnspecifiedErrorContextToUndefined<{
    [SOLANA_ERROR__ACCOUNT_NOT_FOUND]: {
        address: string;
    };
    [SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED]: {
        currentBlockHeight: bigint;
        lastValidBlockHeight: bigint;
    };
    [SOLANA_ERROR__CODECS_CANNOT_DECODE_EMPTY_BYTE_ARRAY]: {
        codecDescription: string;
    };
    [SOLANA_ERROR__CODECS_FIXED_SIZE_ENCODER_DECODER_SIZE_MISMATCH]: {
        decoderFixedSize: number;
        encoderFixedSize: number;
    };
    [SOLANA_ERROR__CODECS_VARIABLE_SIZE_ENCODER_DECODER_MAX_SIZE_MISMATCH]: {
        decoderMaxSize: number | undefined;
        encoderMaxSize: number | undefined;
    };
    [SOLANA_ERROR__CODECS_WRONG_NUMBER_OF_BYTES]: {
        bytesLength: number;
        codecDescription: string;
        expected: number;
    };
    [SOLANA_ERROR__EXPECTED_DECODED_ACCOUNT]: {
        address: string;
    };
    [SOLANA_ERROR__FAILED_TO_DECODE_ACCOUNT]: {
        address: string;
    };
    [SOLANA_ERROR__INCORRECT_BASE58_ADDRESS_BYTE_LENGTH]: {
        actualLength: number;
    };
    [SOLANA_ERROR__INCORRECT_BASE58_ADDRESS_LENGTH]: {
        actualLength: number;
    };
    [SOLANA_ERROR__INVALID_KEYPAIR_BYTES]: {
        byteLength: number;
    };
    [SOLANA_ERROR__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED]: {
        maxSeeds: number;
    };
    [SOLANA_ERROR__MAX_PDA_SEED_LENGTH_EXCEEDED]: {
        index: number;
        maxSeedLength: number;
    };
    [SOLANA_ERROR__MULTIPLE_ACCOUNTS_NOT_FOUND]: {
        addresses: string[];
    };
    [SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND]: {
        nonceAccountAddress: string;
    };
    [SOLANA_ERROR__NONCE_INVALID]: {
        actualNonceValue: string;
        expectedNonceValue: string;
    };
    [SOLANA_ERROR__NOT_A_BASE58_ENCODED_ADDRESS]: {
        putativeAddress: string;
    };
    [SOLANA_ERROR__NOT_ALL_ACCOUNTS_DECODED]: {
        addresses: string[];
    };
    [SOLANA_ERROR__PROGRAM_DERIVED_ADDRESS_BUMP_SEED_OUT_OF_RANGE]: {
        bump: number;
    };
    [SOLANA_ERROR__RPC_INTEGER_OVERFLOW]: {
        argumentLabel: string;
        keyPath: readonly (string | number | symbol)[];
        methodName: string;
        optionalPathLabel: string;
        path?: string;
        value: bigint;
    };
    [SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES]: {
        addresses: string[];
    };
}>;
