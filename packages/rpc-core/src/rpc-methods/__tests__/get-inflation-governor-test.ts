import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { Commitment } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getInflationGovernor', () => {
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
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns the inflation governor result with expected formatting', async () => {
                expect.assertions(1);
                const result = await rpc.getInflationGovernor({ commitment }).send();
                expect(result).toStrictEqual({
                    foundation: expect.any(Number),
                    foundationTerm: expect.any(Number),
                    initial: expect.any(Number),
                    taper: expect.any(Number),
                    terminal: expect.any(Number),
                });
            });
        });
    });
});
