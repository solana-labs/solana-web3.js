import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fs from 'fs';
import fetchMock from 'jest-fetch-mock-fork';
import path from 'path';

import { Commitment, createSolanaRpcApi, SolanaRpcMethods } from '../index';

const logFilePath = path.resolve(__dirname, '../../../../../test-ledger/validator.log');
const confirmedPattern = /My next leader slot is (\d+)/g;
const finalizedPattern = /new root (\d+)/g;

async function waitForBlock(slot: number, commitment: 'confirmed' | 'finalized') {
    const pattern = commitment === 'confirmed' ? confirmedPattern : finalizedPattern;
    let slotFound = false;
    while (!slotFound) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const logs = fs.readFileSync(logFilePath, 'utf8');
        let match;
        let latestSlot: number;
        while ((match = pattern.exec(logs)) !== null) {
            latestSlot = Number(match[1]);
            console.log(`Found slot ${latestSlot}`);
            if (latestSlot >= slot) {
                slotFound = true;
                return;
            }
        }
        await new Promise(resolve => setTimeout(resolve, (slot - latestSlot) * 500));
    }
}

describe('getBlocksWithLimit', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    (['confirmed', 'finalized'] as Exclude<Commitment, 'processed'>[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {});

        describe('when called with a valid `startSlot` and a valid `limit`', () => {
            // On the test validator, finalized blocks tend to be available ~35 slots
            // after the current confirmed slot.
            // So we'll have to wait for a few blocks to be confirmed before we can test this.
            // That means we'll need _at least_ a 35 * 500 ms = 17,500 ms starting buffer
            it('returns 5 blocks for a limit of 5', async () => {
                expect.assertions(1);
                await waitForBlock(5, commitment); // ~500 ms block time x 5 blocks = 2500 ms
                const res = await rpc.getBlocksWithLimit(1n, 5, { commitment }).send();
                expect(res).toHaveLength(5);
            }, 17_500);
        });

        describe('when called with a valid `startSlot` and a `limit` of 0', () => {
            it('returns an empty array', async () => {
                expect.assertions(1);
                await waitForBlock(2, commitment); // ~500 ms block time x 2 blocks = 1000 ms (< 500 ms default)
                const res = await rpc.getBlocksWithLimit(2n, 0, { commitment }).send();
                expect(res).toHaveLength(0);
            });
        });

        describe('when called with a `limit` resulting in a slot higher than the highest slot available', () => {
            // TODO: We need to be able to deterministically set the highest slot
            // so we can test against it, but without making an RPC call like
            // `getSlot` which would defeat the purpose of this test.
            it.todo('returns up to the highest slot available');
        });

        describe('when called with a `startSlot` higher than the highest slot available', () => {
            it('returns an empty array', async () => {
                expect.assertions(1);
                const res = await rpc
                    .getBlocksWithLimit(
                        2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                        3
                    )
                    .send();
                expect(res).toHaveLength(0);
            });
        });

        describe('when called with a `limit` higher than 500,000', () => {
            it('throws an error', async () => {
                expect.assertions(1);
                const sendPromise = rpc.getBlocksWithLimit(0n, 500_001).send();
                await expect(sendPromise).rejects.toMatchObject({
                    code: -32602 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
                    message: expect.any(String),
                    name: 'SolanaJsonRpcError',
                });
            });
        });
    });
});
