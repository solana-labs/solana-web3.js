import type { Address } from '@solana/addresses';

import type { getCompiledAddressTableLookups } from '../../compile-address-table-lookups';
import {
    getAddressTableLookupCodec,
    getAddressTableLookupDecoder,
    getAddressTableLookupEncoder,
} from '../address-table-lookup';

type AddressTableLookup = ReturnType<typeof getCompiledAddressTableLookups>[number];

describe('Address table lookup codec', () => {
    describe.each([getAddressTableLookupEncoder, getAddressTableLookupCodec])(
        'address table lookup encoder %p',
        encoderFactory => {
            let addressTableLookup: ReturnType<typeof getAddressTableLookupEncoder>;
            beforeEach(() => {
                addressTableLookup = encoderFactory();
            });
            it('serializes an `AddressTableLookup` according to the spec', () => {
                expect(
                    addressTableLookup.encode({
                        lookupTableAddress: 'k7FaK87WHGVXzkaoHb7CdVPgkKDQhZ29VLDeBVbDfYn' as Address, // decodes to [11{32}]
                        readableIndices: [33, 22],
                        writableIndices: [44],
                    } as AddressTableLookup),
                ).toEqual(
                    // prettier-ignore
                    new Uint8Array([
                    // Lookup table account address
                    11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, // k7FaK87WHGVXzkaoHb7CdVPgkKDQhZ29VLDeBVbDfYn
                    // Compact array of writable indices
                    1, // Compact-u16 length
                    44, // Writable indicies
                    // Compact array of read-only indices
                    2, // Compact-u16 length
                    33, 22, // Read-only indicies
                ]),
                );
            });
        },
    );

    describe.each([getAddressTableLookupDecoder, getAddressTableLookupCodec])(
        'address table lookup decoder %p',
        decoderFactory => {
            let addressTableLookup: ReturnType<typeof getAddressTableLookupDecoder>;
            beforeEach(() => {
                addressTableLookup = decoderFactory();
            });

            it('deserializes an `AddressTableLookup` according to the spec', () => {
                const byteArray =
                    // prettier-ignore
                    new Uint8Array([
                    // Lookup table account address
                    11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, // k7FaK87WHGVXzkaoHb7CdVPgkKDQhZ29VLDeBVbDfYn
                    // Compact array of writable indices
                    1, // Compact-u16 length
                    44, // Writable indicies
                    // Compact array of read-only indices
                    2, // Compact-u16 length
                    33, 22, // Read-only indicies
                ]);
                const [lookup, offset] = addressTableLookup.read(byteArray, 0);
                expect(lookup).toEqual({
                    lookupTableAddress: 'k7FaK87WHGVXzkaoHb7CdVPgkKDQhZ29VLDeBVbDfYn' as Address, // decodes to [11{32}]
                    readableIndices: [33, 22],
                    writableIndices: [44],
                });
                // Expect the entire byte array to have been consumed.
                expect(offset).toBe(byteArray.byteLength);
            });
        },
    );
});
