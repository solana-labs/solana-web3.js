// Keep in sync with https://github.com/solana-labs/solana/blob/master/rpc-client-api/src/custom_error.rs
// Typescript `enums` thwart tree-shaking. See https://bargsten.org/jsts/enums/
export const SolanaJsonRpcErrorCode = {
    JSON_RPC_INVALID_PARAMS: -32602,
    JSON_RPC_SCAN_ERROR: -32012,
    JSON_RPC_SERVER_ERROR_BLOCK_CLEANED_UP: -32001,
    JSON_RPC_SERVER_ERROR_BLOCK_NOT_AVAILABLE: -32004,
    JSON_RPC_SERVER_ERROR_BLOCK_STATUS_NOT_AVAILABLE_YET: -32014,
    JSON_RPC_SERVER_ERROR_KEY_EXCLUDED_FROM_SECONDARY_INDEX: -32010,
    JSON_RPC_SERVER_ERROR_LONG_TERM_STORAGE_SLOT_SKIPPED: -32009,
    JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED: -32016,
    JSON_RPC_SERVER_ERROR_NODE_UNHEALTHY: -32005,
    JSON_RPC_SERVER_ERROR_NO_SNAPSHOT: -32008,
    JSON_RPC_SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE: -32002,
    JSON_RPC_SERVER_ERROR_SLOT_SKIPPED: -32007,
    JSON_RPC_SERVER_ERROR_TRANSACTION_HISTORY_NOT_AVAILABLE: -32011,
    JSON_RPC_SERVER_ERROR_TRANSACTION_PRECOMPILE_VERIFICATION_FAILURE: -32006,
    JSON_RPC_SERVER_ERROR_TRANSACTION_SIGNATURE_LEN_MISMATCH: -32013,
    JSON_RPC_SERVER_ERROR_TRANSACTION_SIGNATURE_VERIFICATION_FAILURE: -32003,
    JSON_RPC_SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION: -32015,
} as const;
type SolanaJsonRpcErrorCodeEnum = (typeof SolanaJsonRpcErrorCode)[keyof typeof SolanaJsonRpcErrorCode];

type SolanaJsonRpcErrorDetails = Readonly<{
    code: number;
    data?: unknown;
    message: string;
}>;

export class SolanaJsonRpcError extends Error {
    readonly code: SolanaJsonRpcErrorCodeEnum;
    readonly data: unknown;
    constructor(details: SolanaJsonRpcErrorDetails) {
        super(`JSON-RPC 2.0 error (${details.code}): ${details.message}`);
        Error.captureStackTrace(this, this.constructor);
        this.code = details.code as SolanaJsonRpcErrorCodeEnum;
        this.data = details.data;
    }
    get name() {
        return 'SolanaJsonRpcError';
    }
}
