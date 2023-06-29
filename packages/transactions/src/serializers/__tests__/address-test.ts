import { Base58EncodedAddress } from '@solana/keys';

import { getBase58EncodedAddressCodec } from '../address';

describe('Base58 encoded address codec', () => {
    let address: ReturnType<typeof getBase58EncodedAddressCodec>;
    beforeEach(() => {
        address = getBase58EncodedAddressCodec();
    });
    it('serializes a base58 encoded address into a 32-byte buffer', () => {
        expect(
            address.serialize(
                '4wBqpZM9xaSheZzJSMawUHDgZ7miWfSsxmfVF5jJpYP' as Base58EncodedAddress<'4wBqpZM9xaSheZzJSMawUKKwhdpChKbZ5eu5ky4Vigw'>
            )
        ).toEqual(
            new Uint8Array([
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ])
        );
    });
    it('deserializes a byte buffer representing an address into a base58 encoded address', () => {
        expect(
            address.deserialize(
                new Uint8Array([
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
                    28, 29, 30, 31, 32,
                    // Followed by extra bytes not part of the address
                    33, 34,
                ])
            )[0]
        ).toBe(
            '4wBqpZM9xaSheZzJSMawUKKwhdpChKbZ5eu5ky4Vigw' as Base58EncodedAddress<'4wBqpZM9xaSheZzJSMawUKKwhdpChKbZ5eu5ky4Vigw'>
        );
    });
    it('fatals when trying to deserialize a byte buffer shorter than 32-bytes', () => {
        const tooShortBuffer = new Uint8Array(Array(31).fill(0));
        expect(() => address.deserialize(tooShortBuffer)).toThrow();
    });
});
