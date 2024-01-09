import { createHttpTransport, createJsonRpc, type Rpc } from '@solana/rpc-transport';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, MinimumLedgerSlotApi } from '../index';

describe('minimumLedgerSlot', () => {
    let rpc: Rpc<MinimumLedgerSlotApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<MinimumLedgerSlotApi>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });
    describe('when called with no parameters', () => {
        it('returns a bigint', async () => {
            expect.assertions(1);
            const result = await rpc.minimumLedgerSlot().send();
            expect(result).toEqual(expect.any(BigInt));
        });
    });
});
