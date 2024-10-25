import {
    Codec,
    combineCodec,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    transformDecoder,
} from '@solana/codecs-core';
import { getU64Decoder, getU64Encoder, NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';
import { SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE, SolanaError } from '@solana/errors';

export type Lamports = bigint & { readonly __brand: unique symbol };

// Largest possible value to be represented by a u64
const maxU64Value = 18446744073709551615n; // 2n ** 64n - 1n

let memoizedU64Encoder: FixedSizeEncoder<bigint | number, 8> | undefined;
let memoizedU64Decoder: FixedSizeDecoder<bigint, 8> | undefined;

function getMemoizedU64Encoder(): FixedSizeEncoder<bigint | number, 8> {
    if (!memoizedU64Encoder) memoizedU64Encoder = getU64Encoder();
    return memoizedU64Encoder;
}

function getMemoizedU64Decoder(): FixedSizeDecoder<bigint, 8> {
    if (!memoizedU64Decoder) memoizedU64Decoder = getU64Decoder();
    return memoizedU64Decoder;
}

export function isLamports(putativeLamports: bigint): putativeLamports is Lamports {
    return putativeLamports >= 0 && putativeLamports <= maxU64Value;
}

export function assertIsLamports(putativeLamports: bigint): asserts putativeLamports is Lamports {
    if (putativeLamports < 0 || putativeLamports > maxU64Value) {
        throw new SolanaError(SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE);
    }
}

export function lamports(putativeLamports: bigint): Lamports {
    assertIsLamports(putativeLamports);
    return putativeLamports;
}

type ExtractAdditionalProps<T, U> = Omit<T, keyof U>;

export function getDefaultLamportsEncoder(): FixedSizeEncoder<Lamports, 8> {
    return getLamportsEncoder(getMemoizedU64Encoder());
}

export function getLamportsEncoder<TEncoder extends NumberEncoder>(
    innerEncoder: TEncoder,
): Encoder<Lamports> & ExtractAdditionalProps<TEncoder, NumberEncoder> {
    return innerEncoder;
}

export function getDefaultLamportsDecoder(): FixedSizeDecoder<Lamports, 8> {
    return getLamportsDecoder(getMemoizedU64Decoder());
}

export function getLamportsDecoder<TDecoder extends NumberDecoder>(
    innerDecoder: TDecoder,
): Decoder<Lamports> & ExtractAdditionalProps<TDecoder, NumberDecoder> {
    return transformDecoder<bigint | number, Lamports>(innerDecoder, value =>
        lamports(typeof value === 'bigint' ? value : BigInt(value)),
    ) as Decoder<Lamports> & ExtractAdditionalProps<TDecoder, NumberDecoder>;
}

export function getDefaultLamportsCodec(): FixedSizeCodec<Lamports, Lamports, 8> {
    return combineCodec(getDefaultLamportsEncoder(), getDefaultLamportsDecoder());
}

export function getLamportsCodec<TCodec extends NumberCodec>(
    innerCodec: TCodec,
): Codec<Lamports, Lamports> & ExtractAdditionalProps<TCodec, NumberCodec> {
    return combineCodec(getLamportsEncoder(innerCodec), getLamportsDecoder(innerCodec)) as Codec<Lamports, Lamports> &
        ExtractAdditionalProps<TCodec, NumberCodec>;
}
