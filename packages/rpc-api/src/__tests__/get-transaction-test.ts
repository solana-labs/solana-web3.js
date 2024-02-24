// import { createHttpTransport, createJsonRpc, type Rpc } from '@solana/rpc-types';

// import { createSolanaRpcApi, GetTransactionApi } from '../index';

describe('getTransaction', () => {
    // let rpc: Rpc<GetTransactionApi>;
    beforeEach(() => {
        // rpc = createJsonRpc<GetTransactionApi>({
        //   api: createSolanaRpcApi(),
        //   transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        // });
    });

    describe('returns a transaction with the correct shape', () => {
        it.todo('when called with json encoding and maxSupportedTransactionVersion is set');
        it.todo('when called with jsonParsed encoding and maxSupportedTransactionVersion is set');
        it.todo('when called with base58 encoding and maxSupportedTransactionVersion is set');
        it.todo('when called with base64 encoding and maxSupportedTransactionVersion is set');
        it.todo('when called with json encoding and maxSupportedTransactionVersion is not set');
        it.todo('when called with jsonParsed encoding and maxSupportedTransactionVersion is not set');
        it.todo('when called with base58 encoding and maxSupportedTransactionVersion is not set');
        it.todo('when called with base64 encoding and maxSupportedTransactionVersion is not set');
        it.todo('when called without config');
    });

    ['json', 'jsonParsed', 'base64', 'base58'].forEach(_encoding => {
        describe('when requesting a v0 transaction without a defined maxSupportedTransactionVersion', () => {
            it.todo('throws an error'); // -32015 JSON_RPC_SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION
        });
    });
});
