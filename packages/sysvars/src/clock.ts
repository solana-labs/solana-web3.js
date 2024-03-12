import { assertAccountExists, decodeAccount, type FetchAccountConfig } from '@solana/accounts';
import {
    combineCodec,
    type FixedSizeCodec,
    type FixedSizeDecoder,
    type FixedSizeEncoder,
    getI64Decoder,
    getI64Encoder,
    getStructDecoder,
    getStructEncoder,
    getU64Decoder,
    getU64Encoder,
} from '@solana/codecs';
import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';
import type { Epoch, Slot } from '@solana/rpc-types';

import { fetchEncodedSysvarAccount, SYSVAR_CLOCK_ADDRESS } from './sysvar';

type UnixTimestamp = bigint;

type SysvarClockSize = 40;

/**
 * The `Clock` sysvar.
 *
 * Information about the network’s clock, ticks, slots, etc.
 */
export type SysvarClock = Readonly<{
    epoch: Epoch;
    epochStartTimestamp: UnixTimestamp;
    leaderScheduleEpoch: Epoch;
    slot: Slot;
    unixTimestamp: UnixTimestamp;
}>;

export function getSysvarClockEncoder(): FixedSizeEncoder<SysvarClock, SysvarClockSize> {
    return getStructEncoder([
        ['slot', getU64Encoder()],
        ['epochStartTimestamp', getI64Encoder()],
        ['epoch', getU64Encoder()],
        ['leaderScheduleEpoch', getU64Encoder()],
        ['unixTimestamp', getI64Encoder()],
    ]) as FixedSizeEncoder<SysvarClock, SysvarClockSize>;
}

export function getSysvarClockDecoder(): FixedSizeDecoder<SysvarClock, SysvarClockSize> {
    return getStructDecoder([
        ['slot', getU64Decoder()],
        ['epochStartTimestamp', getI64Decoder()],
        ['epoch', getU64Decoder()],
        ['leaderScheduleEpoch', getU64Decoder()],
        ['unixTimestamp', getI64Decoder()],
    ]) as FixedSizeDecoder<SysvarClock, SysvarClockSize>;
}

export function getSysvarClockCodec(): FixedSizeCodec<SysvarClock, SysvarClock, SysvarClockSize> {
    return combineCodec(getSysvarClockEncoder(), getSysvarClockDecoder());
}

/**
 * Fetch the `Clock` sysvar.
 *
 * Information about the network’s clock, ticks, slots, etc.
 */
export async function fetchSysvarClock(rpc: Rpc<GetAccountInfoApi>, config?: FetchAccountConfig): Promise<SysvarClock> {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_CLOCK_ADDRESS, config);
    assertAccountExists(account);
    const decoded = decodeAccount(account, getSysvarClockDecoder());
    return decoded.data;
}
