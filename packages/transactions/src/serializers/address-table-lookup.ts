import { getAddressDecoder, getAddressEncoder } from '@solana/addresses';
import { type Codec, combineCodec, type Decoder, type Encoder } from '@solana/codecs-core';
import { getArrayDecoder, getArrayEncoder, getStructDecoder, getStructEncoder } from '@solana/codecs-data-structures';
import { getShortU16Decoder, getShortU16Encoder, getU8Decoder, getU8Encoder } from '@solana/codecs-numbers';

import type { getCompiledAddressTableLookups } from '../compile-address-table-lookups';

type AddressTableLookup = ReturnType<typeof getCompiledAddressTableLookups>[number];

const lookupTableAddressDescription = __DEV__
    ? 'The address of the address lookup table account from which instruction addresses should be looked up'
    : 'lookupTableAddress';

const writableIndicesDescription = __DEV__
    ? 'The indices of the accounts in the lookup table that should be loaded as writeable'
    : 'writableIndices';

const readableIndicesDescription = __DEV__
    ? 'The indices of the accounts in the lookup table that should be loaded as read-only'
    : 'readableIndices';

const addressTableLookupDescription = __DEV__
    ? 'A pointer to the address of an address lookup table, along with the ' +
      'readonly/writeable indices of the addresses that should be loaded from it'
    : 'addressTableLookup';

let memoizedAddressTableLookupEncoder: Encoder<AddressTableLookup> | undefined;
export function getAddressTableLookupEncoder(): Encoder<AddressTableLookup> {
    if (!memoizedAddressTableLookupEncoder) {
        memoizedAddressTableLookupEncoder = getStructEncoder(
            [
                ['lookupTableAddress', getAddressEncoder({ description: lookupTableAddressDescription })],
                [
                    'writableIndices',
                    getArrayEncoder(getU8Encoder(), {
                        description: writableIndicesDescription,
                        size: getShortU16Encoder(),
                    }) as Encoder<readonly number[]>,
                ],
                [
                    'readableIndices',
                    getArrayEncoder(getU8Encoder(), {
                        description: readableIndicesDescription,
                        size: getShortU16Encoder(),
                    }) as Encoder<readonly number[]>,
                ],
            ],
            { description: addressTableLookupDescription }
        );
    }

    return memoizedAddressTableLookupEncoder;
}

let memoizedAddressTableLookupDecoder: Decoder<AddressTableLookup> | undefined;
export function getAddressTableLookupDecoder(): Decoder<AddressTableLookup> {
    if (!memoizedAddressTableLookupDecoder) {
        memoizedAddressTableLookupDecoder = getStructDecoder(
            [
                ['lookupTableAddress', getAddressDecoder({ description: lookupTableAddressDescription })],
                [
                    'writableIndices',
                    getArrayDecoder(getU8Decoder(), {
                        description: writableIndicesDescription,
                        size: getShortU16Decoder(),
                    }),
                ],
                [
                    'readableIndices',
                    getArrayDecoder(getU8Decoder(), {
                        description: readableIndicesDescription,
                        size: getShortU16Decoder(),
                    }),
                ],
            ],
            { description: addressTableLookupDescription }
        );
    }

    return memoizedAddressTableLookupDecoder;
}

export function getAddressTableLookupCodec(): Codec<AddressTableLookup> {
    return combineCodec(getAddressTableLookupEncoder(), getAddressTableLookupDecoder());
}
