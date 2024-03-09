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
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_NO_SNAPSHOT,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_NODE_UNHEALTHY,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SLOT_SKIPPED,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_HISTORY_NOT_AVAILABLE,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_PRECOMPILE_VERIFICATION_FAILURE,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_SIGNATURE_LEN_MISMATCH,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_SIGNATURE_VERIFICATION_FAILURE,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION,
    SolanaErrorCode,
} from '../codes';
import { SolanaErrorContext } from '../context';
import { SolanaError } from '../error';
import { getSolanaErrorFromJsonRpcError } from '../json-rpc-error';
import { getSolanaErrorFromTransactionError } from '../transaction-error';

jest.mock('../transaction-error.ts');

describe('getSolanaErrorFromJsonRpcError', () => {
    it('produces a `SolanaError` with the same code as the one given', () => {
        const code = 123 as SolanaErrorCode;
        const error = getSolanaErrorFromJsonRpcError({ code, message: 'o no' });
        expect(error).toHaveProperty('context.__code', 123);
    });
    describe.each([
        SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
        SOLANA_ERROR__JSON_RPC__SERVER_ERROR_NODE_UNHEALTHY,
    ])('given a %s JSON-RPC error known to have data', jsonRpcErrorCode => {
        const expectedData = { baz: 'bat', foo: 'bar' } as unknown as SolanaErrorContext[SolanaErrorCode];
        it('does not set the server message on context', () => {
            const error = getSolanaErrorFromJsonRpcError({
                code: jsonRpcErrorCode,
                data: expectedData,
                message: 'o no',
            });
            expect(error).not.toHaveProperty('context.__serverMessage');
        });
        it('produces a `SolanaError` with that data as context', () => {
            const error = getSolanaErrorFromJsonRpcError({
                code: jsonRpcErrorCode,
                data: expectedData,
                message: 'o no',
            });
            expect(error).toHaveProperty('context', expect.objectContaining(expectedData));
        });
    });
    describe.each([
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
        SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SLOT_SKIPPED,
        SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_PRECOMPILE_VERIFICATION_FAILURE,
        SOLANA_ERROR__JSON_RPC__SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION,
    ])(
        'given a %s JSON-RPC error known to have no data but important context in the server message',
        jsonRpcErrorCode => {
            it('produces a `SolanaError` with the server message on the context', () => {
                const error = getSolanaErrorFromJsonRpcError({ code: jsonRpcErrorCode, message: 'o no' });
                expect(error).toHaveProperty('context.__serverMessage', 'o no');
            });
        },
    );
    describe.each([
        SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
        SOLANA_ERROR__JSON_RPC__SERVER_ERROR_NO_SNAPSHOT,
        SOLANA_ERROR__JSON_RPC__SERVER_ERROR_NODE_UNHEALTHY,
        SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_HISTORY_NOT_AVAILABLE,
        SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_SIGNATURE_LEN_MISMATCH,
        SOLANA_ERROR__JSON_RPC__SERVER_ERROR_TRANSACTION_SIGNATURE_VERIFICATION_FAILURE,
    ])(
        'given a %s JSON-RPC error known to have neither data nor important context in the server message',
        jsonRpcErrorCode => {
            it('produces a `SolanaError` without the server message on the context', () => {
                const error = getSolanaErrorFromJsonRpcError({ code: jsonRpcErrorCode, message: 'o no' });
                expect(error).not.toHaveProperty('context.__serverMessage', 'o no');
            });
        },
    );
    describe.each([[1, 2, 3], Symbol('a symbol'), 1, 1n, true, false])('when given non-object data like `%s`', data => {
        it('does not add the data to `context`', () => {
            const error = getSolanaErrorFromJsonRpcError({
                code: 123,
                data,
                message: 'o no',
            });
            expect(error).toHaveProperty(
                'context',
                // Implies exact match; `context` contains nothing but the `__code`
                { __code: 123 },
            );
        });
    });
    describe('when passed a preflight failure', () => {
        it('produces a `SolanaError` with the transaction error as the `cause`', () => {
            const mockErrorResult = Symbol() as unknown as SolanaError;
            jest.mocked(getSolanaErrorFromTransactionError).mockReturnValue(mockErrorResult);
            const error = getSolanaErrorFromJsonRpcError({
                code: SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE,
                data: { err: Symbol() },
                message: 'o no',
            });
            expect(error.cause).toBe(mockErrorResult);
        });
        it('produces a `SolanaError` with the preflight failure data (minus the `err` property) as the context', () => {
            const preflightErrorData = { bar: 2, baz: 3, foo: 1 };
            const error = getSolanaErrorFromJsonRpcError({
                code: SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE,
                data: { ...preflightErrorData, err: Symbol() },
                message: 'o no',
            });
            expect(error.context).toEqual({
                __code: SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE,
                ...preflightErrorData,
            });
        });
        it('delegates `err` to the transaction error getter', () => {
            const transactionError = Symbol();
            getSolanaErrorFromJsonRpcError({
                code: SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE,
                data: { err: transactionError },
                message: 'o no',
            });
            expect(getSolanaErrorFromTransactionError).toHaveBeenCalledWith(transactionError);
        });
    });
});
