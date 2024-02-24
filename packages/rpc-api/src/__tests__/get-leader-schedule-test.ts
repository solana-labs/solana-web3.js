import type { Address } from '@solana/addresses';
import { getBase58Decoder } from '@solana/codecs-strings';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';
import assert from 'assert';
import { open } from 'fs/promises';
import path from 'path';

import { GetLeaderScheduleApi } from '../index';
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

describe('getLeaderSchedule', () => {
    let rpc: Rpc<GetLeaderScheduleApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            describe('when called with no identity and no slot', () => {
                it('returns the leader schedule for all cluster nodes in the current epoch', async () => {
                    expect.assertions(3);
                    const res = await rpc.getLeaderSchedule(null, { commitment }).send();
                    // Does not need null check (default slot)
                    expect(res).toStrictEqual(expect.any(Object));
                    for (const key of Object.keys(res)) {
                        expect(typeof key).toBe('string');
                        // Needs typecasting to be used as accessor
                        const base58Key: Address = key as Address;
                        expect(res[base58Key]).toStrictEqual(expect.any(Array));
                    }
                });
            });

            describe('when called with no identity and a valid slot', () => {
                it('returns the leader schedule for all cluster nodes in the epoch corresponding to the provided slot', async () => {
                    expect.assertions(3);
                    const res = await rpc.getLeaderSchedule(0n, { commitment }).send();
                    // Needs null check (slot provided and may correspond to epoch that does not exist)
                    expect(res).toStrictEqual(expect.any(Object));
                    assert(res);
                    for (const key of Object.keys(res)) {
                        expect(typeof key).toBe('string');
                        // Needs typecasting to be used as accessor
                        const base58Key: Address = key as Address;
                        expect(res[base58Key]).toStrictEqual(expect.any(Array));
                    }
                });
            });

            describe('when called with an account that is a validator identity and no slot', () => {
                it('returns the leader schedule for only the specified node in the current epoch', async () => {
                    expect.assertions(1);
                    const identity = await getValidatorAddress();
                    const res = await rpc
                        .getLeaderSchedule(null, {
                            commitment,
                            identity,
                        })
                        .send();
                    // Does not need null check (default slot)
                    expect(res).toStrictEqual({
                        [identity]: expect.any(Array),
                    });
                });
            });

            describe('when called with an account that is a validator identity and a valid slot', () => {
                it('returns the leader schedule for only the specified node in the epoch corresponding to the provided slot', async () => {
                    expect.assertions(1);
                    const identity = await getValidatorAddress();
                    const res = await rpc
                        .getLeaderSchedule(0n, {
                            commitment,
                            identity,
                        })
                        .send();
                    // Needs null check (slot provided and may correspond to epoch that does not exist)
                    assert(res);
                    expect(res).toStrictEqual({
                        [identity]: expect.any(Array),
                    });
                });
            });
        });

        describe('given an account that exists but is not a validator identity', () => {
            it('returns an empty object', async () => {
                expect.assertions(1);
                const res = await rpc
                    .getLeaderSchedule(null, {
                        commitment,
                        // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
                        identity: 'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address,
                    })
                    .send();
                expect(res).toStrictEqual({});
            });
        });

        describe('given an account that does not exist', () => {
            it('returns an empty object', async () => {
                expect.assertions(1);
                const res = await rpc
                    .getLeaderSchedule(null, {
                        commitment,
                        // Randomly generated
                        identity: 'BnWCFuxmi6uH3ceVx4R8qcbWBMPVVYVVFWtAiiTA1PAu' as Address,
                    })
                    .send();
                expect(res).toStrictEqual({});
            });
        });

        describe('given an invalid slot', () => {
            it('returns an empty object', async () => {
                expect.assertions(1);
                const leaderSchedulePromise = rpc
                    .getLeaderSchedule(
                        2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                        { commitment },
                    )
                    .send();
                await expect(leaderSchedulePromise).resolves.toBeNull();
            });
        });
    });
});
