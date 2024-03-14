import { assertAccountExists, decodeAccount, type FetchAccountConfig } from '@solana/accounts';
import {
    combineCodec,
    type FixedSizeCodec,
    type FixedSizeDecoder,
    type FixedSizeEncoder,
    getStructDecoder,
    getStructEncoder,
} from '@solana/codecs';
import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';
import { getLamportsDecoder, getLamportsEncoder, LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

import { fetchEncodedSysvarAccount, SYSVAR_FEES_ADDRESS } from './sysvar';

type FeeCalculator = Readonly<{
    lamportsPerSignature: LamportsUnsafeBeyond2Pow53Minus1;
}>;

type SysvarFeesSize = 8;

/**
 * The `Fees` sysvar.
 *
 * Current cluster fees.
 */
export type SysvarFees = Readonly<{
    feeCalculator: FeeCalculator;
}>;

export function getSysvarFeesEncoder(): FixedSizeEncoder<SysvarFees, SysvarFeesSize> {
    return getStructEncoder([
        ['feeCalculator', getStructEncoder([['lamportsPerSignature', getLamportsEncoder()]])],
    ]) as FixedSizeEncoder<SysvarFees, SysvarFeesSize>;
}

export function getSysvarFeesDecoder(): FixedSizeDecoder<SysvarFees, SysvarFeesSize> {
    return getStructDecoder([
        ['feeCalculator', getStructDecoder([['lamportsPerSignature', getLamportsDecoder()]])],
    ]) as FixedSizeDecoder<SysvarFees, SysvarFeesSize>;
}

export function getSysvarFeesCodec(): FixedSizeCodec<SysvarFees, SysvarFees, SysvarFeesSize> {
    return combineCodec(getSysvarFeesEncoder(), getSysvarFeesDecoder());
}

/**
 * Fetch the `Fees` sysvar.
 *
 * Current cluster fees.
 */
export async function fetchSysvarFees(rpc: Rpc<GetAccountInfoApi>, config?: FetchAccountConfig): Promise<SysvarFees> {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_FEES_ADDRESS, config);
    assertAccountExists(account);
    const decoded = decodeAccount(account, getSysvarFeesDecoder());
    return decoded.data;
}
