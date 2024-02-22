import type { Rpc } from '@solana/rpc-spec';
import fetchMock from 'jest-fetch-mock-fork';

import { GetMaxRetransmitSlotApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getMaxRetransmitSlot', () => {
    let rpc: Rpc<GetMaxRetransmitSlotApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createLocalhostSolanaRpc();
    });
    describe('when called with no parameters', () => {
        it('returns a bigint', async () => {
            expect.assertions(1);
            const result = await rpc.getMaxRetransmitSlot().send();
            expect(result).toEqual(expect.any(BigInt));
        });
    });
});
