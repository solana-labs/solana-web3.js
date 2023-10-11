import { Codec, combineCodec, Decoder, Encoder, mapEncoder } from '@solana/codecs-core';
import { getBase58Decoder, getBase58Encoder, getStringDecoder, getStringEncoder } from '@solana/codecs-strings';

export type Base58EncodedAddress<TAddress extends string = string> = TAddress & {
    readonly __brand: unique symbol;
};

let memoisedBase58Encoder: Encoder<string> | undefined;
let memoisedBase58Decoder: Decoder<string> | undefined;

function getMemoisedBase58Encoder(): Encoder<string> {
    if (!memoisedBase58Encoder) memoisedBase58Encoder = getBase58Encoder();
    return memoisedBase58Encoder;
}

function getMemoisedBase58Decoder(): Decoder<string> {
    if (!memoisedBase58Decoder) memoisedBase58Decoder = getBase58Decoder();
    return memoisedBase58Decoder;
}

export function isAddress(
    putativeBase58EncodedAddress: string
): putativeBase58EncodedAddress is Base58EncodedAddress<typeof putativeBase58EncodedAddress> {
    // Fast-path; see if the input string is of an acceptable length.
    if (
        // Lowest address (32 bytes of zeroes)
        putativeBase58EncodedAddress.length < 32 ||
        // Highest address (32 bytes of 255)
        putativeBase58EncodedAddress.length > 44
    ) {
        return false;
    }
    // Slow-path; actually attempt to decode the input string.
    const base58Encoder = getMemoisedBase58Encoder();
    const bytes = base58Encoder.encode(putativeBase58EncodedAddress);
    const numBytes = bytes.byteLength;
    if (numBytes !== 32) {
        return false;
    }
    return true;
}

export function assertIsAddress(
    putativeBase58EncodedAddress: string
): asserts putativeBase58EncodedAddress is Base58EncodedAddress<typeof putativeBase58EncodedAddress> {
    try {
        // Fast-path; see if the input string is of an acceptable length.
        if (
            // Lowest address (32 bytes of zeroes)
            putativeBase58EncodedAddress.length < 32 ||
            // Highest address (32 bytes of 255)
            putativeBase58EncodedAddress.length > 44
        ) {
            throw new Error('Expected input string to decode to a byte array of length 32.');
        }
        // Slow-path; actually attempt to decode the input string.
        const base58Encoder = getMemoisedBase58Encoder();
        const bytes = base58Encoder.encode(putativeBase58EncodedAddress);
        const numBytes = bytes.byteLength;
        if (numBytes !== 32) {
            throw new Error(`Expected input string to decode to a byte array of length 32. Actual length: ${numBytes}`);
        }
    } catch (e) {
        throw new Error(`\`${putativeBase58EncodedAddress}\` is not a base-58 encoded address`, {
            cause: e,
        });
    }
}

export function address<TAddress extends string = string>(
    putativeBase58EncodedAddress: TAddress
): Base58EncodedAddress<TAddress> {
    assertIsAddress(putativeBase58EncodedAddress);
    return putativeBase58EncodedAddress as Base58EncodedAddress<TAddress>;
}

export function getAddressEncoder(config?: Readonly<{ description: string }>): Encoder<Base58EncodedAddress> {
    return mapEncoder(
        getStringEncoder({
            description: config?.description ?? 'Base58EncodedAddress',
            encoding: getMemoisedBase58Encoder(),
            size: 32,
        }),
        putativeAddress => address(putativeAddress)
    );
}

export function getAddressDecoder(config?: Readonly<{ description: string }>): Decoder<Base58EncodedAddress> {
    return getStringDecoder({
        description: config?.description ?? 'Base58EncodedAddress',
        encoding: getMemoisedBase58Decoder(),
        size: 32,
    }) as Decoder<Base58EncodedAddress>;
}

export function getAddressCodec(config?: Readonly<{ description: string }>): Codec<Base58EncodedAddress> {
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
