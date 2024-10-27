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
import {
    type Blockhash,
    getBlockhashDecoder,
    getBlockhashEncoder,
    getDefaultLamportsDecoder,
    getDefaultLamportsEncoder,
    type Lamports,
} from '@solana/rpc-types';

import { fetchEncodedSysvarAccount, SYSVAR_RECENT_BLOCKHASHES_ADDRESS } from './sysvar';

type FeeCalculator = Readonly<{
    lamportsPerSignature: Lamports;
}>;
type Entry = Readonly<{
    blockhash: Blockhash;
    feeCalculator: FeeCalculator;
}>;

/**
 * The `RecentBlockhashes` sysvar.
 *
 * Information about recent blocks and their fee calculators.
 */
export type SysvarRecentBlockhashes = Entry[];

export function getSysvarRecentBlockhashesEncoder(): VariableSizeEncoder<SysvarRecentBlockhashes> {
    return getArrayEncoder(
        getStructEncoder([
            ['blockhash', getBlockhashEncoder()],
            ['feeCalculator', getStructEncoder([['lamportsPerSignature', getDefaultLamportsEncoder()]])],
        ]),
    );
}

export function getSysvarRecentBlockhashesDecoder(): VariableSizeDecoder<SysvarRecentBlockhashes> {
    return getArrayDecoder(
        getStructDecoder([
            ['blockhash', getBlockhashDecoder()],
            ['feeCalculator', getStructDecoder([['lamportsPerSignature', getDefaultLamportsDecoder()]])],
        ]),
    );
}

export function getSysvarRecentBlockhashesCodec(): VariableSizeCodec<SysvarRecentBlockhashes> {
    return combineCodec(getSysvarRecentBlockhashesEncoder(), getSysvarRecentBlockhashesDecoder());
}

/**
 * Fetch the `RecentBlockhashes` sysvar.
 *
 * Information about recent blocks and their fee calculators.
 */
export async function fetchSysvarRecentBlockhashes(
    rpc: Rpc<GetAccountInfoApi>,
    config?: FetchAccountConfig,
): Promise<SysvarRecentBlockhashes> {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_RECENT_BLOCKHASHES_ADDRESS, config);
    assertAccountExists(account);
    const decoded = decodeAccount(account, getSysvarRecentBlockhashesDecoder());
    return decoded.data;
}
