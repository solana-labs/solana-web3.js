import { Signature } from '@solana/keys';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

describe('getSignatureStatuses', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    describe('when called with a valid transaction signature', () => {
        [true, false].forEach(searchTransactionHistory => {
            describe(`with \`searchTransactionHistory\`: ${searchTransactionHistory} and one signature provided`, () => {
                // TODO: Cannot test this until we have a way to mock
                // some transactions without RPC methods
                it.todo('returns a signature status with the correct shape');
            });

            describe(`with \`searchTransactionHistory\`: ${searchTransactionHistory} and multiple signatures provided`, () => {
                // TODO: Cannot test this until we have a way to mock
                // some transactions without RPC methods
                it.todo('returns a signature status with the correct shape');
            });
        });
    });

    describe('when called with no transaction signature provided', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            const signatureStatusPromise = rpc.getSignatureStatuses([]).send();
            await expect(signatureStatusPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [],
            });
        });
    });

    describe('when called with an invalid transaction signature', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const signatureStatusPromise = rpc.getSignatureStatuses(['invalid_signature' as Signature]).send();
            await expect(signatureStatusPromise).rejects.toMatchObject({
                code: -32602 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });

    describe('when called with a transaction signature that does not exist', () => {
        it('returns null for that signature', async () => {
            expect.assertions(1);
            const signatureStatusPromise = rpc
                .getSignatureStatuses([
                    // Randomly generated
                    '4Vx3PAb665jCLRpbpgKshZuwKP6TUgoSDDAbKEsyvkKhwrNDT6CE5d7MT1vEPkgEo1cmr7zsM8h724wRnjyCAoR3' as Signature,
                ])
                .send();
            await expect(signatureStatusPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [null],
            });
        });
    });
});
