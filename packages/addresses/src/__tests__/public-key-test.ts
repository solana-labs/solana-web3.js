import { getAddressFromPublicKey } from '../public-key';

// Corresponds to address `DcESq8KFcdTdpjWtr2DoGcvu5McM3VJoBetgM1X1vVct`
const MOCK_PUBLIC_KEY_BYTES = new Uint8Array([
    0xbb, 0x52, 0xc6, 0x2d, 0x52, 0x4f, 0x7f, 0xea, 0x4f, 0x2c, 0x27, 0x13, 0xd6, 0x20, 0x80, 0xad, 0x6a, 0x36, 0x9a,
    0x0e, 0x36, 0x71, 0x74, 0x32, 0x8d, 0x1a, 0xf7, 0xee, 0x7e, 0x04, 0x76, 0x19,
]);

describe('getAddressFromPublicKey', () => {
    it('returns the public key that corresponds to a given secret key', async () => {
        expect.assertions(1);
        const publicKey = await crypto.subtle.importKey(
            'raw',
            MOCK_PUBLIC_KEY_BYTES,
            'Ed25519',
            /* extractable */ true,
            ['verify'],
        );
        await expect(getAddressFromPublicKey(publicKey)).resolves.toBe('DcESq8KFcdTdpjWtr2DoGcvu5McM3VJoBetgM1X1vVct');
    });
    it('throws when the public key is non-extractable', async () => {
        expect.assertions(1);
        const publicKey = await crypto.subtle.importKey(
            'raw',
            MOCK_PUBLIC_KEY_BYTES,
            'Ed25519',
            /* extractable */ false,
            ['verify'],
        );
        await expect(() => getAddressFromPublicKey(publicKey)).rejects.toThrow();
    });
    it('throws when called with a secret', async () => {
        expect.assertions(1);
        const publicKey = await crypto.subtle.generateKey(
            {
                length: 256,
                name: 'AES-GCM',
            },
            true,
            ['encrypt', 'decrypt'],
        );
        await expect(() => getAddressFromPublicKey(publicKey)).rejects.toThrow();
    });
    it.each([
        { __variant: 'P256', name: 'ECDSA', namedCurve: 'P-256' },
        { __variant: 'P384', name: 'ECDSA', namedCurve: 'P-384' } as EcKeyGenParams,
        { __variant: 'P521', name: 'ECDSA', namedCurve: 'P-521' } as EcKeyGenParams,
        ...['RSASSA-PKCS1-v1_5', 'RSA-PSS'].flatMap(rsaAlgoName =>
            ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].map(
                hashName =>
                    ({
                        __variant: hashName,
                        hash: { name: hashName },
                        modulusLength: 2048,
                        name: rsaAlgoName,
                        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                    }) as RsaHashedKeyGenParams,
            ),
        ),
    ])('throws when called with a $name/$__variant public key', async algorithm => {
        expect.assertions(1);
        const { publicKey } = await crypto.subtle.generateKey(algorithm, true, ['sign', 'verify']);
        await expect(() => getAddressFromPublicKey(publicKey)).rejects.toThrow();
    });
    it('throws when called with a private key', async () => {
        expect.assertions(1);
        const mockPrivateKey = await crypto.subtle.importKey(
            'pkcs8',
            new Uint8Array([
                0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20, 0xf2,
                0x29, 0xe0, 0x33, 0x09, 0x44, 0x10, 0xd9, 0x64, 0x80, 0x42, 0x85, 0x9a, 0x18, 0x5c, 0x4a, 0x45, 0x45,
                0xd9, 0xd1, 0x75, 0xeb, 0x30, 0x89, 0xb4, 0x2b, 0x7b, 0xe3, 0xca, 0xbf, 0x63, 0xc9,
            ]),
            'Ed25519',
            /* extractable */ false,
            ['sign'],
        );
        await expect(() => getAddressFromPublicKey(mockPrivateKey)).rejects.toThrow();
    });
});
