import { assertAccountExists, decodeAccount, type FetchAccountConfig } from '@solana/accounts';
import {
    combineCodec,
    type FixedSizeCodec,
    type FixedSizeDecoder,
    type FixedSizeEncoder,
    getBooleanDecoder,
    getBooleanEncoder,
    getStructDecoder,
    getStructEncoder,
    getU64Decoder,
    getU64Encoder,
} from '@solana/codecs';
import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';
import type { Epoch, Slot } from '@solana/rpc-types';

import { fetchEncodedSysvarAccount, SYSVAR_EPOCH_SCHEDULE_ADDRESS } from './sysvar';

type SysvarEpochScheduleSize = 33;

/**
 * The `EpochSchedule` sysvar.
 *
 * Information about epoch duration.
 */
export type SysvarEpochSchedule = Readonly<{
    firstNormalEpoch: Epoch;
    firstNormalSlot: Slot;
    leaderScheduleSlotOffset: bigint;
    slotsPerEpoch: bigint;
    warmup: boolean;
}>;

export function getSysvarEpochScheduleEncoder(): FixedSizeEncoder<SysvarEpochSchedule, SysvarEpochScheduleSize> {
    return getStructEncoder([
        ['slotsPerEpoch', getU64Encoder()],
        ['leaderScheduleSlotOffset', getU64Encoder()],
        ['warmup', getBooleanEncoder()],
        ['firstNormalEpoch', getU64Encoder()],
        ['firstNormalSlot', getU64Encoder()],
    ]) as FixedSizeEncoder<SysvarEpochSchedule, SysvarEpochScheduleSize>;
}

export function getSysvarEpochScheduleDecoder(): FixedSizeDecoder<SysvarEpochSchedule, SysvarEpochScheduleSize> {
    return getStructDecoder([
        ['slotsPerEpoch', getU64Decoder()],
        ['leaderScheduleSlotOffset', getU64Decoder()],
        ['warmup', getBooleanDecoder()],
        ['firstNormalEpoch', getU64Decoder()],
        ['firstNormalSlot', getU64Decoder()],
    ]) as FixedSizeDecoder<SysvarEpochSchedule, SysvarEpochScheduleSize>;
}

export function getSysvarEpochScheduleCodec(): FixedSizeCodec<
    SysvarEpochSchedule,
    SysvarEpochSchedule,
    SysvarEpochScheduleSize
> {
    return combineCodec(getSysvarEpochScheduleEncoder(), getSysvarEpochScheduleDecoder());
}

/**
 * Fetch the `EpochSchedule` sysvar.
 *
 * Information about epoch duration.
 */
export async function fetchSysvarEpochSchedule(
    rpc: Rpc<GetAccountInfoApi>,
    config?: FetchAccountConfig,
): Promise<SysvarEpochSchedule> {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_EPOCH_SCHEDULE_ADDRESS, config);
    assertAccountExists(account);
    const decoded = decodeAccount(account, getSysvarEpochScheduleDecoder());
    return decoded.data;
}
