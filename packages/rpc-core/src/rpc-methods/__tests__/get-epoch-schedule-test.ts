import { createHttpTransport, createJsonRpc, type Rpc } from '@solana/rpc-transport';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, GetEpochScheduleApi } from '../index';

describe('getEpochSchedule', () => {
    let rpc: Rpc<GetEpochScheduleApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<GetEpochScheduleApi>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    it('returns the epoch schedule', async () => {
        expect.assertions(1);
        const epochSchedulePromise = rpc.getEpochSchedule().send();
        await expect(epochSchedulePromise).resolves.toStrictEqual({
            firstNormalEpoch: expect.any(BigInt),
            firstNormalSlot: expect.any(BigInt),
            leaderScheduleSlotOffset: expect.any(BigInt),
            slotsPerEpoch: expect.any(BigInt),
            warmup: expect.any(Boolean),
        });
    });
});
