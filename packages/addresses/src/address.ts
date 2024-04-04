import {
    combineCodec,
    Decoder,
    Encoder,
    fixDecoderSize,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    fixEncoderSize,
    transformEncoder,
} from '@solana/codecs-core';
import { getBase58Decoder, getBase58Encoder } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__ADDRESSES__INVALID_BYTE_LENGTH,
    SOLANA_ERROR__ADDRESSES__STRING_LENGTH_OUT_OF_RANGE,
    SolanaError,
} from '@solana/errors';

export type Address<TAddress extends string = string> = TAddress & {
    readonly __brand: unique symbol;
};

let memoizedBase58Encoder: Encoder<string> | undefined;
let memoizedBase58Decoder: Decoder<string> | undefined;

function getMemoizedBase58Encoder(): Encoder<string> {
    if (!memoizedBase58Encoder) memoizedBase58Encoder = getBase58Encoder();
    return memoizedBase58Encoder;
}

function getMemoizedBase58Decoder(): Decoder<string> {
    if (!memoizedBase58Decoder) memoizedBase58Decoder = getBase58Decoder();
    return memoizedBase58Decoder;
}

export function isAddress(putativeAddress: string): putativeAddress is Address<typeof putativeAddress> {
    // Fast-path; see if the input string is of an acceptable length.
    if (
        // Lowest address (32 bytes of zeroes)
        putativeAddress.length < 32 ||
        // Highest address (32 bytes of 255)
        putativeAddress.length > 44
    ) {
        return false;
    }
    // Slow-path; actually attempt to decode the input string.
    const base58Encoder = getMemoizedBase58Encoder();
    const bytes = base58Encoder.encode(putativeAddress);
    const numBytes = bytes.byteLength;
    if (numBytes !== 32) {
        return false;
    }
    return true;
}

export function assertIsAddress(putativeAddress: string): asserts putativeAddress is Address<typeof putativeAddress> {
    // Fast-path; see if the input string is of an acceptable length.
    if (
        // Lowest address (32 bytes of zeroes)
        putativeAddress.length < 32 ||
        // Highest address (32 bytes of 255)
        putativeAddress.length > 44
    ) {
        throw new SolanaError(SOLANA_ERROR__ADDRESSES__STRING_LENGTH_OUT_OF_RANGE, {
            actualLength: putativeAddress.length,
        });
    }
    // Slow-path; actually attempt to decode the input string.
    const base58Encoder = getMemoizedBase58Encoder();
    const bytes = base58Encoder.encode(putativeAddress);
    const numBytes = bytes.byteLength;
    if (numBytes !== 32) {
        throw new SolanaError(SOLANA_ERROR__ADDRESSES__INVALID_BYTE_LENGTH, {
            actualLength: numBytes,
        });
    }
}

export function address<TAddress extends string = string>(putativeAddress: TAddress): Address<TAddress> {
    assertIsAddress(putativeAddress);
    return putativeAddress as Address<TAddress>;
}

export function getAddressEncoder(): FixedSizeEncoder<Address, 32> {
    return transformEncoder(fixEncoderSize(getMemoizedBase58Encoder(), 32), putativeAddress =>
        address(putativeAddress),
    );
}

export function getAddressDecoder(): FixedSizeDecoder<Address, 32> {
    return fixDecoderSize(getMemoizedBase58Decoder(), 32) as FixedSizeDecoder<Address, 32>;
}

export function getAddressCodec(): FixedSizeCodec<Address, Address, 32> {
    return combineCodec(getAddressEncoder(), getAddressDecoder());
}

export function getAddressComparator(): (x: string, y: string) => number {
    return new Intl.Collator('en', {
        caseFirst: 'lower',
        ignorePunctuation: false,
        localeMatcher: 'best fit',
        numeric: false,
        sensitivity: 'variant',
        usage: 'sort',
    }).compare;
}
