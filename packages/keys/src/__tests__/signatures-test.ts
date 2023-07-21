import { Ed25519Signature, signBytes, verifySignature } from '../signatures';

const MOCK_DATA = new Uint8Array([1, 2, 3]);
const MOCK_DATA_SIGNATURE = new Uint8Array([
    66, 111, 184, 228, 239, 189, 127, 46, 23, 168, 117, 69, 58, 143, 132, 164, 112, 189, 203, 228, 183, 151, 0, 23, 179,
    181, 52, 75, 112, 225, 150, 128, 184, 164, 36, 21, 101, 205, 115, 28, 127, 221, 24, 135, 229, 8, 69, 232, 16, 225,
    44, 229, 17, 236, 206, 174, 102, 207, 79, 253, 96, 7, 174, 10,
]) as Ed25519Signature;
const MOCK_PKCS8_PRIVATE_KEY =
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
                0xeb, 0xfa, 0x65, 0xeb, 0x93, 0xdc, 0x79, 0x15,
                0x7a, 0xba, 0xde, 0xa2, 0xf7, 0x94, 0x37, 0x9d,
                0xfc, 0x07, 0x1d, 0x68, 0x86, 0x87, 0x37, 0x6d,
                0xc5, 0xd5, 0xa0, 0x54, 0x12, 0x1d, 0x34, 0x4a,
    ]);
const MOCK_PUBLIC_KEY_BYTES = new Uint8Array([
    29, 14, 147, 134, 77, 204, 129, 95, 195, 242, 134, 24, 9, 17, 208, 10, 63, 210, 6, 222, 49, 161, 201, 66, 135, 203,
    67, 240, 95, 201, 242, 181,
]);

describe('sign', () => {
    let oldIsSecureContext: boolean;
    beforeEach(() => {
        oldIsSecureContext = globalThis.isSecureContext;
        globalThis.isSecureContext = true;
    });
    afterEach(() => {
        globalThis.isSecureContext = oldIsSecureContext;
    });
    it('produces the expected signature given a private key', async () => {
        expect.assertions(1);
        const privateKey = await crypto.subtle.importKey(
            'pkcs8',
            MOCK_PKCS8_PRIVATE_KEY,
            'Ed25519',
            /* extractable */ false,
            ['sign']
        );
        const signature = await signBytes(privateKey, MOCK_DATA);
        expect(signature).toEqual(MOCK_DATA_SIGNATURE);
    });
    it('produces signatures 64 bytes in length', async () => {
        expect.assertions(1);
        const { privateKey } = (await crypto.subtle.generateKey('Ed25519', /* extractable */ false, [
            'sign',
        ])) as CryptoKeyPair;
        const signature = await signBytes(privateKey, MOCK_DATA);
        expect(signature).toHaveLength(64);
    });
});

describe('verify', () => {
    let mockPublicKey: CryptoKey;
    let oldIsSecureContext: boolean;
    beforeEach(async () => {
        mockPublicKey = await crypto.subtle.importKey(
            'raw',
            MOCK_PUBLIC_KEY_BYTES,
            'Ed25519',
            /* extractable */ false,
            ['verify']
        );
        oldIsSecureContext = globalThis.isSecureContext;
        globalThis.isSecureContext = true;
    });
    afterEach(() => {
        globalThis.isSecureContext = oldIsSecureContext;
    });
    it('returns `true` when the correct signature is supplied for a given payload', async () => {
        expect.assertions(1);
        const result = await verifySignature(mockPublicKey, MOCK_DATA_SIGNATURE, MOCK_DATA);
        expect(result).toBe(true);
    });
    it('returns `false` when a bad signature is supplied for a given payload', async () => {
        expect.assertions(1);
        const badSignature = new Uint8Array(Array(64).fill(1)) as Ed25519Signature;
        const result = await verifySignature(mockPublicKey, badSignature, MOCK_DATA);
        expect(result).toBe(false);
    });
    it('returns `false` when the signature 65 bytes long', async () => {
        expect.assertions(1);
        const badSignature = new Uint8Array([...MOCK_DATA_SIGNATURE, 1]) as Ed25519Signature;
        const result = await verifySignature(mockPublicKey, badSignature, MOCK_DATA);
        expect(result).toBe(false);
    });
    it('returns `false` when the signature 63 bytes long', async () => {
        expect.assertions(1);
        const badSignature = MOCK_DATA_SIGNATURE.slice(0, 63) as Ed25519Signature;
        const result = await verifySignature(mockPublicKey, badSignature, MOCK_DATA);
        expect(result).toBe(false);
    });
});
