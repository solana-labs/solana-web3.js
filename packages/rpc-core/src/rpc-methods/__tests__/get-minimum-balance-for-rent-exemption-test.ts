import { createHttpTransport, createJsonRpc, type Rpc } from '@solana/rpc-transport';
import { Commitment } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, GetMinimumBalanceForRentExemptionApi } from '../index';

describe('getMinimumBalanceForRentExemption', () => {
    let rpc: Rpc<GetMinimumBalanceForRentExemptionApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<GetMinimumBalanceForRentExemptionApi>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns an expected rent amount', async () => {
                expect.assertions(1);
                const result = await rpc.getMinimumBalanceForRentExemption(BigInt(0), { commitment }).send();
                expect(result).toEqual(BigInt(890880));
            });
        });
    });
});
