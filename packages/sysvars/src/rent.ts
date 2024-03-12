import { assertAccountExists, decodeAccount, type FetchAccountConfig } from '@solana/accounts';
import {
    combineCodec,
    type FixedSizeCodec,
    type FixedSizeDecoder,
    type FixedSizeEncoder,
    getF64Decoder,
    getF64Encoder,
    getStructDecoder,
    getStructEncoder,
    getU8Decoder,
    getU8Encoder,
} from '@solana/codecs';
import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';
import { getLamportsDecoder, getLamportsEncoder, type LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

import { fetchEncodedSysvarAccount, SYSVAR_RENT_ADDRESS } from './sysvar';

type SysvarRentSize = 17;

/**
 * The `Rent` sysvar.
 *
 * Configuration for network rent.
 */
export type SysvarRent = Readonly<{
    burnPercent: number;
    exemptionThreshold: number;
    lamportsPerByteYear: LamportsUnsafeBeyond2Pow53Minus1;
}>;

export function getSysvarRentEncoder(): FixedSizeEncoder<SysvarRent, SysvarRentSize> {
    return getStructEncoder([
        ['lamportsPerByteYear', getLamportsEncoder()],
        ['exemptionThreshold', getF64Encoder()],
        ['burnPercent', getU8Encoder()],
    ]) as FixedSizeEncoder<SysvarRent, SysvarRentSize>;
}

export function getSysvarRentDecoder(): FixedSizeDecoder<SysvarRent, SysvarRentSize> {
    return getStructDecoder([
        ['lamportsPerByteYear', getLamportsDecoder()],
        ['exemptionThreshold', getF64Decoder()],
        ['burnPercent', getU8Decoder()],
    ]) as FixedSizeDecoder<SysvarRent, SysvarRentSize>;
}

export function getSysvarRentCodec(): FixedSizeCodec<SysvarRent, SysvarRent, SysvarRentSize> {
    return combineCodec(getSysvarRentEncoder(), getSysvarRentDecoder());
}

/**
 * Fetch the `Rent` sysvar.
 *
 * Configuration for network rent.
 */
export async function fetchSysvarRent(rpc: Rpc<GetAccountInfoApi>, config?: FetchAccountConfig): Promise<SysvarRent> {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_RENT_ADDRESS, config);
    assertAccountExists(account);
    const decoded = decodeAccount(account, getSysvarRentDecoder());
    return decoded.data;
}
