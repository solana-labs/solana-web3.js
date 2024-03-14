import { assertAccountExists, decodeAccount, type FetchAccountConfig } from '@solana/accounts';
import {
    combineCodec,
    type FixedSizeCodec,
    type FixedSizeDecoder,
    type FixedSizeEncoder,
    getStructDecoder,
    getStructEncoder,
    getU64Decoder,
    getU64Encoder,
} from '@solana/codecs';
import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';
import type { Slot } from '@solana/rpc-types';

import { fetchEncodedSysvarAccount, SYSVAR_LAST_RESTART_SLOT_ADDRESS } from './sysvar';

type SysvarLastRestartSlotSize = 8;

/**
 * The `LastRestartSlot` sysvar.
 *
 * Information about the last restart slot (hard fork).
 *
 * The `LastRestartSlot` sysvar provides access to the last restart slot kept in the
 * bank fork for the slot on the fork that executes the current transaction.
 * In case there was no fork it returns `0`.
 */
export type SysvarLastRestartSlot = Readonly<{
    lastRestartSlot: Slot;
}>;

export function getSysvarLastRestartSlotEncoder(): FixedSizeEncoder<SysvarLastRestartSlot, SysvarLastRestartSlotSize> {
    return getStructEncoder([['lastRestartSlot', getU64Encoder()]]) as FixedSizeEncoder<
        SysvarLastRestartSlot,
        SysvarLastRestartSlotSize
    >;
}

export function getSysvarLastRestartSlotDecoder(): FixedSizeDecoder<SysvarLastRestartSlot, SysvarLastRestartSlotSize> {
    return getStructDecoder([['lastRestartSlot', getU64Decoder()]]) as FixedSizeDecoder<
        SysvarLastRestartSlot,
        SysvarLastRestartSlotSize
    >;
}

export function getSysvarLastRestartSlotCodec(): FixedSizeCodec<
    SysvarLastRestartSlot,
    SysvarLastRestartSlot,
    SysvarLastRestartSlotSize
> {
    return combineCodec(getSysvarLastRestartSlotEncoder(), getSysvarLastRestartSlotDecoder());
}

/**
 * Fetch the `LastRestartSlot` sysvar.
 *
 * Information about the last restart slot (hard fork).
 *
 * The `LastRestartSlot` sysvar provides access to the last restart slot kept in the
 * bank fork for the slot on the fork that executes the current transaction.
 * In case there was no fork it returns `0`.
 */
export async function fetchSysvarLastRestartSlot(
    rpc: Rpc<GetAccountInfoApi>,
    config?: FetchAccountConfig,
): Promise<SysvarLastRestartSlot> {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_LAST_RESTART_SLOT_ADDRESS, config);
    assertAccountExists(account);
    const decoded = decodeAccount(account, getSysvarLastRestartSlotDecoder());
    return decoded.data;
}
