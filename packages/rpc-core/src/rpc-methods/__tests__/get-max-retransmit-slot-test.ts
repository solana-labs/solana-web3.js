import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, GetMaxRetransmitSlotApi } from '../index';

describe('getMaxRetransmitSlot', () => {
    let rpc: Rpc<GetMaxRetransmitSlotApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<GetMaxRetransmitSlotApi>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });
    describe('when called with no parameters', () => {
        it('returns a bigint', async () => {
            expect.assertions(1);
            const result = await rpc.getMaxRetransmitSlot().send();
            expect(result).toEqual(expect.any(BigInt));
        });
    });
});
