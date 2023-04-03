import { createJsonRpcTransport } from '..';
import { Transport } from '../json-rpc-transport-types';

import { SolanaJsonRpcApi } from '@solana/rpc-core';
import { Commitment } from '@solana/rpc-core/dist/types/types/rpc-methods/common';

import fetchMock from 'jest-fetch-mock';
import { SolanaJsonRpcError, SolanaJsonRpcErrorCode } from '../json-rpc-errors';

describe('getBlockHeight', () => {
    let transport: Transport<SolanaJsonRpcApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        transport = createJsonRpcTransport<SolanaJsonRpcApi>({ url: 'http://127.0.0.1:8899' });
    });
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it.failing('returns the block height as a bigint', async () => {
                expect.assertions(1);
                const blockHeight = await transport.getBlockHeight({ commitment }).send();
                expect(blockHeight).toEqual(expect.any(BigInt));
            });
        });
    });
    describe('when called with a `minContextSlot` of 0', () => {
        it.failing('returns the block height as a bigint', async () => {
            expect.assertions(1);
            const blockHeight = await transport.getBlockHeight({ minContextSlot: 0n }).send();
            expect(blockHeight).toEqual(expect.any(BigInt));
        });
    });
    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(2);
            const sendPromise = transport
                .getBlockHeight({
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(sendPromise).rejects.toThrow(SolanaJsonRpcError);
            await expect(sendPromise).rejects.toMatchObject({
                code: SolanaJsonRpcErrorCode.JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
                message: expect.any(String),
            });
        });
    });
});
