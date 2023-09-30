import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getInflationRate', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });
    // TODO: I honestly have no clue how to test this
    describe(`when called`, () => {
        it('returns the inflation rate result with expected formatting', async () => {
            expect.assertions(1);
            const result = await rpc.getInflationRate().send();
            expect(result).toStrictEqual({
                epoch: expect.any(BigInt),
                foundation: expect.any(Number),
                total: expect.any(Number),
                validator: expect.any(Number),
            });
        });
    });
});
