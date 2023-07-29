import { array, Serializer, shortU16, struct, StructToSerializerTuple, u8 } from '@metaplex-foundation/umi-serializers';
import { getBase58EncodedAddressCodec } from '@solana/addresses';

import { getCompiledAddressTableLookups } from '../compile-address-table-lookups';

type AddressTableLookup = ReturnType<typeof getCompiledAddressTableLookups>[number];

export function getAddressTableLookupCodec(): Serializer<AddressTableLookup> {
    return struct(
        [
            [
                'lookupTableAddress',
                getBase58EncodedAddressCodec(
                    __DEV__
                        ? {
                              description:
                                  'The address of the address lookup table account from which ' +
                                  'instruction addresses should be looked up',
                          }
                        : undefined
                ),
            ],
            [
                'writableIndices',
                array(u8(), {
                    ...(__DEV__
                        ? {
                              description:
                                  'The indices of the accounts in the lookup table that should ' +
                                  'be loaded as writeable',
                          }
                        : null),
                    size: shortU16(),
                }),
            ],
            [
                'readableIndices',
                array(u8(), {
                    ...(__DEV__
                        ? {
                              description:
                                  'The indices of the accounts in the lookup table that should ' +
                                  'be loaded as read-only',
                          }
                        : undefined),
                    size: shortU16(),
                }),
            ],
        ] as StructToSerializerTuple<AddressTableLookup, AddressTableLookup>,
        __DEV__
            ? {
                  description:
                      'A pointer to the address of an address lookup table, along with the ' +
                      'readonly/writeable indices of the addresses that should be loaded from it',
              }
            : undefined
    );
}
