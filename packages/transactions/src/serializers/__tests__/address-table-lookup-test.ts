import { Base58EncodedAddress } from '@solana/addresses';

import { getCompiledAddressTableLookups } from '../../compile-address-table-lookups';
import { getAddressTableLookupCodec } from '../address-table-lookup';

type AddressTableLookup = ReturnType<typeof getCompiledAddressTableLookups>[number];

describe('Address table lookup serializer', () => {
    let addressTableLookup: ReturnType<typeof getAddressTableLookupCodec>;
    beforeEach(() => {
        addressTableLookup = getAddressTableLookupCodec();
    });
    it('serializes an `AddressTableLookup` according to the spec', () => {
        expect(
            addressTableLookup.serialize({
                lookupTableAddress: 'k7FaK87WHGVXzkaoHb7CdVPgkKDQhZ29VLDeBVbDfYn' as Base58EncodedAddress, // decodes to [11{32}]
                readableIndices: [33, 22],
                writableIndices: [44],
            } as AddressTableLookup)
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
            ])
        );
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
        const [lookup, offset] = addressTableLookup.deserialize(byteArray);
        expect(lookup).toEqual({
            lookupTableAddress: 'k7FaK87WHGVXzkaoHb7CdVPgkKDQhZ29VLDeBVbDfYn' as Base58EncodedAddress, // decodes to [11{32}]
            readableIndices: [33, 22],
            writableIndices: [44],
        });
        // Expect the entire byte array to have been consumed.
        expect(offset).toBe(byteArray.byteLength);
    });
});
