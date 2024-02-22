import { open } from 'node:fs/promises';

import type { Address } from '@solana/addresses';
import { getBase58Decoder } from '@solana/codecs-strings';
import type { Rpc } from '@solana/rpc-spec';
import { RpcError } from '@solana/rpc-spec-types';
import type { Commitment, SolanaRpcErrorCode } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';
import path from 'path';

import { GetSlotLeaderApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const validatorKeypairPath = path.resolve(__dirname, '../../../../test-ledger/validator-keypair.json');

async function getValidatorAddress() {
    const file = await open(validatorKeypairPath);
    try {
        let secretKey: Uint8Array | undefined;
        for await (const line of file.readLines({ encoding: 'binary' })) {
            secretKey = new Uint8Array(JSON.parse(line));
            break; // Only need the first line
        }
        if (secretKey) {
            const publicKey = secretKey.slice(32, 64);
            const expectedAddress = getBase58Decoder().decode(publicKey);
            return expectedAddress as Address;
        }
        throw new Error(`Failed to read keypair file \`${validatorKeypairPath}\``);
    } finally {
        await file.close();
    }
}

describe('getSlotLeader', () => {
    let rpc: Rpc<GetSlotLeaderApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            describe('when called with no `minContextSlot`', () => {
                // This will always be the local validator
                it("returns the leader's address", async () => {
                    expect.assertions(1);
                    const slotLeaderPromise = rpc.getSlotLeader({ commitment }).send();
                    await expect(slotLeaderPromise).resolves.toEqual(await getValidatorAddress());
                });
            });

            describe('when called with a valid `minContextSlot`', () => {
                // This will always be the local validator
                it("returns the leader's address", async () => {
                    expect.assertions(1);
                    const slotLeaderPromise = rpc.getSlotLeader({ commitment, minContextSlot: 0n }).send();
                    await expect(slotLeaderPromise).resolves.toEqual(await getValidatorAddress());
                });
            });
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(2);
            const sendPromise = rpc
                .getSlotLeader({
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(sendPromise).rejects.toThrow(RpcError);
            await expect(sendPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
            });
        });
    });
});
