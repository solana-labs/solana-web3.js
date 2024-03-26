import { createPrivateKeyFromBytes } from '../private-key';

const MOCK_DATA = new Uint8Array([1, 2, 3]);
const MOCK_DATA_SIGNATURE = new Uint8Array([
    66, 111, 184, 228, 239, 189, 127, 46, 23, 168, 117, 69, 58, 143, 132, 164, 112, 189, 203, 228, 183, 151, 0, 23, 179,
    181, 52, 75, 112, 225, 150, 128, 184, 164, 36, 21, 101, 205, 115, 28, 127, 221, 24, 135, 229, 8, 69, 232, 16, 225,
    44, 229, 17, 236, 206, 174, 102, 207, 79, 253, 96, 7, 174, 10,
]);
const MOCK_PRIVATE_KEY_BYTES = new Uint8Array([
    0xeb, 0xfa, 0x65, 0xeb, 0x93, 0xdc, 0x79, 0x15, 0x7a, 0xba, 0xde, 0xa2, 0xf7, 0x94, 0x37, 0x9d, 0xfc, 0x07, 0x1d,
    0x68, 0x86, 0x87, 0x37, 0x6d, 0xc5, 0xd5, 0xa0, 0x54, 0x12, 0x1d, 0x34, 0x4a,
]);

describe('createPrivateKeyFromBytes', () => {
    it.each([0, 16, 31, 33])('throws when the bytes are of length %s', async length => {
        expect.assertions(1);
        await expect(createPrivateKeyFromBytes(new Uint8Array(length))).rejects.toThrow();
    });
    describe('given a key created from valid private key bytes', () => {
        let privateKey: CryptoKey;
        beforeEach(async () => {
            privateKey = await createPrivateKeyFromBytes(MOCK_PRIVATE_KEY_BYTES);
        });
        it('is non-extractable', () => {
            expect(privateKey).toHaveProperty('extractable', false);
        });
        it('has the expected metadata', () => {
            expect(privateKey).toMatchObject({
                [Symbol.toStringTag]: 'CryptoKey',
                algorithm: { name: 'Ed25519' },
                type: 'private',
                usages: ['sign'],
            });
        });
        it('can be used to produce the expected signature', async () => {
            expect.assertions(1);
            const signature = await crypto.subtle.sign('Ed25519', privateKey, MOCK_DATA);
            expect(new Uint8Array(signature)).toEqual(MOCK_DATA_SIGNATURE);
        });
    });
    describe.each([true, false])(
        'given a key created with the `extractable` option set to `%s`',
        expectedExtractability => {
            let privateKey: CryptoKey;
            beforeEach(async () => {
                privateKey = await createPrivateKeyFromBytes(
                    MOCK_PRIVATE_KEY_BYTES,
                    /* extractable */ expectedExtractability,
                );
            });
            it('has the expected extractability', () => {
                expect(privateKey).toHaveProperty('extractable', expectedExtractability);
            });
            if (expectedExtractability) {
                it('can be exported', async () => {
                    expect.assertions(1);
                    expect(new Uint8Array(await crypto.subtle.exportKey('pkcs8', privateKey))).toEqual(
                        // prettier-ignore
                        new Uint8Array([
                            /**
                             * PKCS#8 header
                             */
                            0x30, // ASN.1 sequence tag
                            0x2e, // Length of sequence (46 more bytes)

                                0x02, // ASN.1 integer tag
                                0x01, // Length of integer
                                    0x00, // Version number

                                0x30, // ASN.1 sequence tag
                                0x05, // Length of sequence
                                    0x06, // ASN.1 object identifier tag
                                    0x03, // Length of object identifier
                                        // Edwards curve algorithms identifier https://oid-rep.orange-labs.fr/get/1.3.101.112
                                            0x2b, // iso(1) / identified-organization(3) (The first node is multiplied by the decimal 40 and the result is added to the value of the second node)
                                            0x65, // thawte(101)
                                        // Ed25519 identifier
                                            0x70, // id-Ed25519(112)

                            /**
                             * Private key payload
                             */
                            0x04, // ASN.1 octet string tag
                            0x22, // String length (34 more bytes)

                                // Private key bytes as octet string
                                0x04, // ASN.1 octet string tag
                                0x20, // String length (32 bytes)
                                ...MOCK_PRIVATE_KEY_BYTES,
                        ]),
                    );
                });
            } else {
                it('throws if you try to export it', async () => {
                    expect.assertions(1);
                    await expect(crypto.subtle.exportKey('pkcs8', privateKey)).rejects.toThrow(
                        'key is not extractable',
                    );
                });
            }
        },
    );
});
