import { Codec, combineCodec, Decoder, Encoder, mapEncoder } from '@solana/codecs-core';
import { getBase58Decoder, getBase58Encoder, getStringDecoder, getStringEncoder } from '@solana/codecs-strings';

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
    try {
        // Fast-path; see if the input string is of an acceptable length.
        if (
            // Lowest address (32 bytes of zeroes)
            putativeAddress.length < 32 ||
            // Highest address (32 bytes of 255)
            putativeAddress.length > 44
        ) {
            throw new Error('Expected input string to decode to a byte array of length 32.');
        }
        // Slow-path; actually attempt to decode the input string.
        const base58Encoder = getMemoizedBase58Encoder();
        const bytes = base58Encoder.encode(putativeAddress);
        const numBytes = bytes.byteLength;
        if (numBytes !== 32) {
            throw new Error(`Expected input string to decode to a byte array of length 32. Actual length: ${numBytes}`);
        }
    } catch (e) {
        throw new Error(`\`${putativeAddress}\` is not a base-58 encoded address`, {
            cause: e,
        });
    }
}

export function address<TAddress extends string = string>(putativeAddress: TAddress): Address<TAddress> {
    assertIsAddress(putativeAddress);
    return putativeAddress as Address<TAddress>;
}

export function getAddressEncoder(config?: Readonly<{ description: string }>): Encoder<Address> {
    return mapEncoder(
        getStringEncoder({
            description: config?.description ?? 'Address',
            encoding: getMemoizedBase58Encoder(),
            size: 32,
        }),
        putativeAddress => address(putativeAddress)
    );
}

export function getAddressDecoder(config?: Readonly<{ description: string }>): Decoder<Address> {
    return getStringDecoder({
        description: config?.description ?? 'Address',
        encoding: getMemoizedBase58Decoder(),
        size: 32,
    }) as Decoder<Address>;
}

export function getAddressCodec(config?: Readonly<{ description: string }>): Codec<Address> {
    return combineCodec(getAddressEncoder(config), getAddressDecoder(config));
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
