import {
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
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SLOT_SKIPPED,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_PRECOMPILE_VERIFICATION_FAILURE,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION,
    SolanaErrorCode,
} from './codes';
import { SolanaErrorContext } from './context';
import { SolanaError } from './error';
import { safeCaptureStackTrace } from './stack-trace';
import { getSolanaErrorFromTransactionError } from './transaction-error';

interface RpcErrorResponse {
    code: number;
    data?: unknown;
    message: string;
}

type TransactionError = string | { [key: string]: unknown };

// Keep in sync with https://github.com/anza-xyz/agave/blob/master/rpc-client-api/src/response.rs
export interface RpcSimulateTransactionResult {
    accounts:
        | ({
              data:
                  | string // LegacyBinary
                  | {
                        // Json
                        parsed: unknown;
                        program: string;
                        space: number;
                    }
                  // Binary
                  | [encodedBytes: string, encoding: 'base58' | 'base64' | 'base64+zstd' | 'binary' | 'jsonParsed'];
              executable: boolean;
              lamports: number;
              owner: string;
              rentEpoch: number;
              space?: number;
          } | null)[]
        | null;
    err: TransactionError | null;
    // Enabled by `enable_cpi_recording`
    innerInstructions?:
        | {
              index: number;
              instructions: (
                  | {
                        // Compiled
                        accounts: number[];
                        data: string;
                        programIdIndex: number;
                        stack_height?: number;
                    }
                  | {
                        // Parsed
                        parsed: unknown;
                        program: string;
                        program_id: string;
                        stack_height?: number;
                    }
                  | {
                        // PartiallyDecoded
                        accounts: string[];
                        data: string;
                        program_id: string;
                        stack_height?: number;
                    }
              )[];
          }[]
        | null;
    logs: string[] | null;
    returnData: {
        data: [string, 'base64'];
        programId: string;
    } | null;
    unitsConsumed: number | null;
}

export function getSolanaErrorFromJsonRpcError({ code, data, message }: RpcErrorResponse): SolanaError {
    let out: SolanaError;
    if (code === SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE) {
        const { err, ...preflightErrorContext } = data as RpcSimulateTransactionResult;
        const causeObject = err ? { cause: getSolanaErrorFromTransactionError(err) } : null;
        out = new SolanaError(SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE, {
            ...preflightErrorContext,
            ...causeObject,
        });
    } else {
        let errorContext;
        switch (code) {
            case SOLANA_ERROR__JSON_RPC__INTERNAL_ERROR:
            case SOLANA_ERROR__JSON_RPC__INVALID_PARAMS:
            case SOLANA_ERROR__JSON_RPC__INVALID_REQUEST:
            case SOLANA_ERROR__JSON_RPC__METHOD_NOT_FOUND:
            case SOLANA_ERROR__JSON_RPC__PARSE_ERROR:
            case SOLANA_ERROR__JSON_RPC__SCAN_ERROR:
            case SOLANA_ERROR__JSON_RPC__SERVER_ERROR_BLOCK_CLEANED_UP:
            case SOLANA_ERROR__JSON_RPC__SERVER_ERROR_BLOCK_NOT_AVAILABLE:
            case SOLANA_ERROR__JSON_RPC__SERVER_ERROR_BLOCK_STATUS_NOT_AVAILABLE_YET:
            case SOLANA_ERROR__JSON_RPC__SERVER_ERROR_KEY_EXCLUDED_FROM_SECONDARY_INDEX:
            case SOLANA_ERROR__JSON_RPC__SERVER_ERROR_LONG_TERM_STORAGE_SLOT_SKIPPED:
            case SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SLOT_SKIPPED:
            case SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_PRECOMPILE_VERIFICATION_FAILURE:
            case SOLANA_ERROR__JSON_RPC__SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION:
                // The server supplies no structured data, but rather a pre-formatted message. Put
                // the server message in `context` so as not to completely lose the data. The long
                // term fix for this is to add data to the server responses and modify the
                // messages in `@solana/errors` to be actual format strings.
                errorContext = { __serverMessage: message };
                break;
            default:
                if (typeof data === 'object' && !Array.isArray(data)) {
                    errorContext = data;
                }
        }
        out = new SolanaError(code as SolanaErrorCode, errorContext as SolanaErrorContext[SolanaErrorCode]);
    }
    safeCaptureStackTrace(out, getSolanaErrorFromJsonRpcError);
    return out;
}
