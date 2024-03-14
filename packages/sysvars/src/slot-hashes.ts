import { assertAccountExists, decodeAccount, type FetchAccountConfig } from '@solana/accounts';
import {
    combineCodec,
    getArrayDecoder,
    getArrayEncoder,
    getStructDecoder,
    getStructEncoder,
    getU64Decoder,
    getU64Encoder,
    type VariableSizeCodec,
    type VariableSizeDecoder,
    type VariableSizeEncoder,
} from '@solana/codecs';
import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';
import { type Blockhash, getBlockhashDecoder, getBlockhashEncoder, type Slot } from '@solana/rpc-types';

import { fetchEncodedSysvarAccount, SYSVAR_SLOT_HASHES_ADDRESS } from './sysvar';

type Entry = Readonly<{
    hash: Blockhash;
    slot: Slot;
}>;

/**
 * The `SlotHashes` sysvar.
 *
 * The most recent hashes of a slot's parent banks.
 */
export type SysvarSlotHashes = Entry[];

export function getSysvarSlotHashesEncoder(): VariableSizeEncoder<SysvarSlotHashes> {
    return getArrayEncoder(
        getStructEncoder([
            ['slot', getU64Encoder()],
            ['hash', getBlockhashEncoder()],
        ]),
    );
}

export function getSysvarSlotHashesDecoder(): VariableSizeDecoder<SysvarSlotHashes> {
    return getArrayDecoder(
        getStructDecoder([
            ['slot', getU64Decoder()],
            ['hash', getBlockhashDecoder()],
        ]),
    );
}

export function getSysvarSlotHashesCodec(): VariableSizeCodec<SysvarSlotHashes> {
    return combineCodec(getSysvarSlotHashesEncoder(), getSysvarSlotHashesDecoder());
}

/**
 * Fetch the `SlotHashes` sysvar.
 *
 * The most recent hashes of a slot's parent banks.
 */
export async function fetchSysvarSlotHashes(
    rpc: Rpc<GetAccountInfoApi>,
    config?: FetchAccountConfig,
): Promise<SysvarSlotHashes> {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_SLOT_HASHES_ADDRESS, config);
    assertAccountExists(account);
    const decoded = decodeAccount(account, getSysvarSlotHashesDecoder());
    return decoded.data;
}
