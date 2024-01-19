import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Commitment, Rpc } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, GetStakeMinimumDelegationApi } from '../index';

describe('getStakeMinimumDelegation', () => {
    let rpc: Rpc<GetStakeMinimumDelegationApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<GetStakeMinimumDelegationApi>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns the result as a bigint wrapped in an RpcResponse', async () => {
                expect.assertions(1);
                const result = await rpc.getStakeMinimumDelegation({ commitment }).send();
                expect(result.value).toEqual(expect.any(BigInt));
            });
        });
    });
});
