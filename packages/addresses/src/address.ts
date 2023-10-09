import { base58, Serializer, string } from '@metaplex-foundation/umi-serializers';

export type Base58EncodedAddress<TAddress extends string = string> = TAddress & {
    readonly __brand: unique symbol;
};

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
    const bytes = base58.serialize(putativeBase58EncodedAddress);
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
        const bytes = base58.serialize(putativeBase58EncodedAddress);
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

export function getAddressCodec(
    config?: Readonly<{
        description: string;
    }>
): Serializer<Base58EncodedAddress> {
    return string({
        description: config?.description ?? (__DEV__ ? 'A 32-byte account address' : ''),
        encoding: base58,
        size: 32,
    }) as unknown as Serializer<Base58EncodedAddress>;
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
