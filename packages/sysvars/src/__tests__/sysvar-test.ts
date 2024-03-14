import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';

import {
    fetchEncodedSysvarAccount,
    fetchJsonParsedSysvarAccount,
    SYSVAR_CLOCK_ADDRESS,
    SYSVAR_EPOCH_SCHEDULE_ADDRESS,
    SYSVAR_FEES_ADDRESS,
} from '../sysvar';
import { createLocalhostSolanaRpc } from './__setup__';

describe('sysvar account', () => {
    let rpc: Rpc<GetAccountInfoApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    const assertValidEncodedSysvarAccount = async (address: Parameters<typeof fetchEncodedSysvarAccount>[1]) => {
        const account = await fetchEncodedSysvarAccount(rpc, address);
        expect(account.address).toEqual(address);
        expect(account.exists).toBe(true);
        expect(account).toMatchObject({
            data: expect.any(Uint8Array),
        });
    };
    const assertValidJsonParsedSysvarAccount = async (
        address: Parameters<typeof fetchEncodedSysvarAccount>[1],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any,
    ) => {
        const account = await fetchJsonParsedSysvarAccount(rpc, address);
        expect(account.address).toEqual(address);
        expect(account.exists).toBe(true);
        expect(account).toMatchObject(data);
    };
    describe('clock', () => {
        it('fetch encoded', async () => {
            expect.assertions(3);
            await assertValidEncodedSysvarAccount(SYSVAR_CLOCK_ADDRESS);
        });
        it('fetch JSON-parsed', async () => {
            expect.assertions(3);
            await assertValidJsonParsedSysvarAccount(SYSVAR_CLOCK_ADDRESS, {
                data: {
                    epoch: expect.any(BigInt),
                    epochStartTimestamp: expect.any(BigInt),
                    leaderScheduleEpoch: expect.any(BigInt),
                    slot: expect.any(BigInt),
                    unixTimestamp: expect.any(BigInt),
                },
            });
        });
    });
    // `EpochRewards` will only appear at the start of an epoch, after epoch 0 concludes.
    // See https://github.com/solana-labs/solana/blob/e0203f22dc83cb792fa97f91dbe6e924cbd08af1/docs/src/runtime/sysvars.md?plain=1#L155-L168
    describe('epoch schedule', () => {
        it('fetch encoded', async () => {
            expect.assertions(3);
            await assertValidEncodedSysvarAccount(SYSVAR_EPOCH_SCHEDULE_ADDRESS);
        });
        it('fetch JSON-parsed', async () => {
            expect.assertions(3);
            await assertValidJsonParsedSysvarAccount(SYSVAR_EPOCH_SCHEDULE_ADDRESS, {
                data: {
                    firstNormalEpoch: expect.any(BigInt),
                    firstNormalSlot: expect.any(BigInt),
                    leaderScheduleSlotOffset: expect.any(BigInt),
                    slotsPerEpoch: expect.any(BigInt),
                    warmup: expect.any(Boolean),
                },
            });
        });
    });
    describe('fees', () => {
        it('fetch encoded', async () => {
            expect.assertions(3);
            await assertValidEncodedSysvarAccount(SYSVAR_FEES_ADDRESS);
        });
        it('fetch JSON-parsed', async () => {
            expect.assertions(3);
            await assertValidJsonParsedSysvarAccount(SYSVAR_FEES_ADDRESS, {
                data: {
                    feeCalculator: {
                        lamportsPerSignature: expect.any(String), // JsonParsed converts to string
                    },
                },
            });
        });
    });
    // `Instructions` does not exist on-chain.
});
