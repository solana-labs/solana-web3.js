import { assertAccountExists, decodeAccount, type FetchAccountConfig } from '@solana/accounts';
import {
    combineCodec,
    getArrayDecoder,
    getArrayEncoder,
    getStructDecoder,
    getStructEncoder,
    type VariableSizeCodec,
    type VariableSizeDecoder,
    type VariableSizeEncoder,
} from '@solana/codecs';
import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';
import { getLamportsDecoder, getLamportsEncoder, type LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

import { fetchEncodedSysvarAccount, SYSVAR_STAKE_HISTORY_ADDRESS } from './sysvar';

type Entry = Readonly<{
    activating: LamportsUnsafeBeyond2Pow53Minus1;
    deactivating: LamportsUnsafeBeyond2Pow53Minus1;
    effective: LamportsUnsafeBeyond2Pow53Minus1;
}>;

/**
 * The `StakeHistory` sysvar.
 *
 * History of stake activations and de-activations.
 */
export type SysvarStakeHistory = Entry[];

export function getSysvarStakeHistoryEncoder(): VariableSizeEncoder<SysvarStakeHistory> {
    return getArrayEncoder(
        getStructEncoder([
            ['effective', getLamportsEncoder()],
            ['activating', getLamportsEncoder()],
            ['deactivating', getLamportsEncoder()],
        ]),
    );
}

export function getSysvarStakeHistoryDecoder(): VariableSizeDecoder<SysvarStakeHistory> {
    return getArrayDecoder(
        getStructDecoder([
            ['effective', getLamportsDecoder()],
            ['activating', getLamportsDecoder()],
            ['deactivating', getLamportsDecoder()],
        ]),
    );
}

export function getSysvarStakeHistoryCodec(): VariableSizeCodec<SysvarStakeHistory> {
    return combineCodec(getSysvarStakeHistoryEncoder(), getSysvarStakeHistoryDecoder());
}

/**
 * Fetch the `StakeHistory` sysvar.
 *
 * History of stake activations and de-activations.
 */
export async function fetchSysvarStakeHistory(
    rpc: Rpc<GetAccountInfoApi>,
    config?: FetchAccountConfig,
): Promise<SysvarStakeHistory> {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_STAKE_HISTORY_ADDRESS, config);
    assertAccountExists(account);
    const decoded = decodeAccount(account, getSysvarStakeHistoryDecoder());
    return decoded.data;
}
