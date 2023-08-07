import { base58 } from '@metaplex-foundation/umi-serializers';
import { Base58EncodedAddress } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import assert from 'assert';
import fetchMock from 'jest-fetch-mock-fork';

import validatorIdentityBytes from '../../../../../test-ledger/validator-keypair.json';
import { Commitment, Slot } from '../common';
import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

function getValidatorAddress(): Base58EncodedAddress {
    const secretKey = new Uint8Array(validatorIdentityBytes);
    const publicKey = secretKey.slice(32, 64);
    const address = base58.deserialize(publicKey)[0];
    return address as Base58EncodedAddress;
}

describe('getLeaderSchedule', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        ([undefined, 0n] as (Slot | undefined)[]).forEach(slot => {
            describe(`given a ${commitment} commitment and ${slot} slot`, () => {
                // TODO: With added control over the local validator, we
                // should add a check to ensure these are actually the right epoch
                const slotDescription = slot ? `corresponding` : 'current';
                describe('given no identity', () => {
                    it(`returns the leader schedule for all cluster nodes in the ${slotDescription} epoch`, async () => {
                        expect.assertions(3);
                        const res = await rpc.getLeaderSchedule(slot, { commitment }).send();
                        expect(res).toMatchObject(expect.any(Object));
                        assert(res);
                        for (const key of Object.keys(res)) {
                            expect(typeof key).toBe('string');
                            // Needs typecasting to be used as accessor
                            const base58Key: Base58EncodedAddress = key as Base58EncodedAddress;
                            expect(res[base58Key]).toMatchObject(expect.any(Array));
                        }
                    });
                });

                describe('given an account that is a validator identity', () => {
                    it(`returns the leader schedule for only the specified node in the ${slotDescription} epoch`, async () => {
                        expect.assertions(1);
                        const identity = getValidatorAddress();
                        const res = await rpc
                            .getLeaderSchedule(slot, {
                                commitment,
                                identity,
                            })
                            .send();
                        expect(res).toMatchObject({
                            [identity]: expect.any(Array),
                        });
                    });
                });

                describe('given an account that exists but is not a validator identity', () => {
                    it('returns an empty object', async () => {
                        expect.assertions(1);
                        const res = await rpc
                            .getLeaderSchedule(undefined, {
                                commitment,
                                // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
                                identity: 'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress,
                            })
                            .send();
                        expect(res).toMatchObject({});
                    });
                });

                describe('given an account that does not exist', () => {
                    it('returns an empty object', async () => {
                        expect.assertions(1);
                        const res = await rpc
                            .getLeaderSchedule(undefined, {
                                commitment,
                                // Randomly generated
                                identity: 'BnWCFuxmi6uH3ceVx4R8qcbWBMPVVYVVFWtAiiTA1PAu' as Base58EncodedAddress,
                            })
                            .send();
                        expect(res).toMatchObject({});
                    });
                });
            });
        });

        describe('given an invalid slot', () => {
            it('returns an empty object', async () => {
                expect.assertions(1);
                const leaderSchedulePromise = rpc
                    .getLeaderSchedule(
                        2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                        { commitment }
                    )
                    .send();
                await expect(leaderSchedulePromise).resolves.toBeNull();
            });
        });
    });
});
