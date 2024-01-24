import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, GetMaxShredInsertSlotApi } from '../index';

describe('getMaxShredInsertSlot', () => {
    let rpc: Rpc<GetMaxShredInsertSlotApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<GetMaxShredInsertSlotApi>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });
    describe('when called with no parameters', () => {
        it('returns a bigint', async () => {
            expect.assertions(1);
            const result = await rpc.getMaxShredInsertSlot().send();
            expect(result).toEqual(expect.any(BigInt));
        });
    });
});
