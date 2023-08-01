import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getBlockCommitment', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    it('returns the block commitment for an older block, which has null commitment', async () => {
        expect.assertions(1);
        const getBlockCommitmentPromise = rpc.getBlockCommitment(0n).send();
        await expect(getBlockCommitmentPromise).resolves.toMatchObject({
            commitment: null,
            totalStake: expect.any(BigInt),
        });
    });

    // TODO: We need a good way to feed `getBlockCommitment` a recent block.
    // This would actually return a value for commitment.
    // This is tricky to do without `getSlot`, and we'll need some kind
    // of manipulation capability over test-validator to pull it off without
    // another RPC call.
    it.todo('returns the block commitment for a recent block');
});
