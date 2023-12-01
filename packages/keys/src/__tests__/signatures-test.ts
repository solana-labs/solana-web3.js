import { createEncoder, VariableSizeEncoder } from '@solana/codecs-core';
import { getBase58Encoder } from '@solana/codecs-strings';

import { createPrivateKeyFromBytes } from '../private-key';
import { SignatureBytes, signBytes, verifySignature } from '../signatures';

jest.mock('@solana/codecs-strings', () => ({
    ...jest.requireActual('@solana/codecs-strings'),
    getBase58Encoder: jest.fn(),
}));

const MOCK_DATA = new Uint8Array([1, 2, 3]);
const MOCK_DATA_SIGNATURE = new Uint8Array([
    66, 111, 184, 228, 239, 189, 127, 46, 23, 168, 117, 69, 58, 143, 132, 164, 112, 189, 203, 228, 183, 151, 0, 23, 179,
    181, 52, 75, 112, 225, 150, 128, 184, 164, 36, 21, 101, 205, 115, 28, 127, 221, 24, 135, 229, 8, 69, 232, 16, 225,
    44, 229, 17, 236, 206, 174, 102, 207, 79, 253, 96, 7, 174, 10,
]) as SignatureBytes;
const MOCK_PRIVATE_KEY_BYTES = new Uint8Array([
    0xeb, 0xfa, 0x65, 0xeb, 0x93, 0xdc, 0x79, 0x15, 0x7a, 0xba, 0xde, 0xa2, 0xf7, 0x94, 0x37, 0x9d, 0xfc, 0x07, 0x1d,
    0x68, 0x86, 0x87, 0x37, 0x6d, 0xc5, 0xd5, 0xa0, 0x54, 0x12, 0x1d, 0x34, 0x4a,
]);
const MOCK_PUBLIC_KEY_BYTES = new Uint8Array([
    0x1d, 0x0e, 0x93, 0x86, 0x4d, 0xcc, 0x81, 0x5f, 0xc3, 0xf2, 0x86, 0x18, 0x09, 0x11, 0xd0, 0x0a, 0x3f, 0xd2, 0x06,
    0xde, 0x31, 0xa1, 0xc9, 0x42, 0x87, 0xcb, 0x43, 0xf0, 0x5f, 0xc9, 0xf2, 0xb5,
]);

// real implementations
const originalBase58Module = jest.requireActual('@solana/codecs-strings');
const originalGetBase58Encoder = originalBase58Module.getBase58Encoder();

describe('assertIsSignature()', () => {
    let assertIsSignature: typeof import('../signatures').assertIsSignature;
    // Reload `assertIsSignature` before each test to reset memoized state
    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            const base58ModulePromise =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                import('../signatures');
            assertIsSignature = (await base58ModulePromise).assertIsSignature;
        });
    });

    describe('using the real base58 implementation', () => {
        beforeEach(() => {
            // use real implementation
            jest.mocked(getBase58Encoder).mockReturnValue(originalGetBase58Encoder);
        });

        it('throws when supplied a non-base58 string', () => {
            expect(() => {
                assertIsSignature('not-a-base-58-encoded-string');
            }).toThrow();
        });
        it('throws when the decoded byte array has a length other than 32 bytes', () => {
            expect(() => {
                assertIsSignature(
                    // 63 bytes [128, ..., 128]
                    '1'.repeat(63),
                );
            }).toThrow();
        });
        it('does not throw when supplied a base-58 encoded signature', () => {
            expect(() => {
                // 64 bytes [0, ..., 0]
                assertIsSignature('1'.repeat(64));

                // example signatures
                assertIsSignature(
                    '5HkW5GttYoahVHaujuxEyfyq7RwvoKpc94ko5Fq9GuYdyhejg9cHcqm1MjEvHsjaADRe6hVBqB2E4RQgGgxeA2su',
                );
                assertIsSignature(
                    '2VZm7DkqSKaHxsGiAuVuSkvEbGWf7JrfRdPTw42WKuJC8qw7yQbGL5AE7UxHH3tprgmT9EVbambnK9h3PLpvMvES',
                );
                assertIsSignature(
                    '5sXRtm61WrRGRTjJ6f2anKUWt86Y4V9gWU4WUpue4T4Zh6zuvFoSyaX5LkEtChfqVC8oHdqLo2eUXbhVduThBdfG',
                );
                assertIsSignature(
                    '2Dy6Qai5JyChoP4BKoh9KAYhpD96CUhmEce1GJ8HpV5h8Q4CgUt8KZQzhVNDEQYcjARxYyBNhNjhKUGC2XLZtCCm',
                );
            }).not.toThrow();
        });
        it('returns undefined when supplied a base-58 encoded signature', () => {
            // 64 bytes [0, ..., 0]
            expect(assertIsSignature('1'.repeat(64))).toBeUndefined();
        });
    });

    describe('using a mock base58 implementation', () => {
        const mockWrite = jest.fn();
        beforeEach(() => {
            // use mock implementation
            mockWrite.mockClear();
            jest.mocked(getBase58Encoder).mockReturnValue(
                createEncoder({
                    fixedSize: 64,
                    write: mockWrite,
                }) as unknown as VariableSizeEncoder<string>,
            );
        });
        [64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88].forEach(
            len => {
                it(`attempts to decode input strings of exactly ${len} characters`, () => {
                    try {
                        assertIsSignature('1'.repeat(len));
                        // eslint-disable-next-line no-empty
                    } catch {}
                    expect(mockWrite).toHaveBeenCalledTimes(1);
                });
            },
        );
        it('does not attempt to decode too-short input strings', () => {
            try {
                assertIsSignature(
                    // 63 bytes [0, ..., 0]
                    '1'.repeat(63),
                );
                // eslint-disable-next-line no-empty
            } catch {}
            expect(mockWrite).not.toHaveBeenCalled();
        });
        it('does not attempt to decode too-long input strings', () => {
            try {
                assertIsSignature(
                    // 65 bytes [0, 255, ..., 255]
                    '167rpwLCuS5DGA8KGZXKsVQ7dnPb9goRLoKfgGbLfQg9WoLUgNY77E2jT11fem3coV9nAkguBACzrU1iyZM4B8roQ',
                );
                // eslint-disable-next-line no-empty
            } catch {}
            expect(mockWrite).not.toHaveBeenCalled();
        });
        it('memoizes getBase58Encoder when called multiple times', () => {
            try {
                assertIsSignature('1'.repeat(64));
                // eslint-disable-next-line no-empty
            } catch {}
            try {
                assertIsSignature('1'.repeat(64));
                // eslint-disable-next-line no-empty
            } catch {}
            expect(jest.mocked(getBase58Encoder)).toHaveBeenCalledTimes(1);
        });
    });
});

describe('sign', () => {
    it('produces the expected signature given a private key', async () => {
        expect.assertions(1);
        const privateKey = await createPrivateKeyFromBytes(MOCK_PRIVATE_KEY_BYTES, /* extractable */ false);
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
    beforeEach(async () => {
        mockPublicKey = await crypto.subtle.importKey(
            'raw',
            MOCK_PUBLIC_KEY_BYTES,
            'Ed25519',
            /* extractable */ false,
            ['verify'],
        );
    });
    it('returns `true` when the correct signature is supplied for a given payload', async () => {
        expect.assertions(1);
        const result = await verifySignature(mockPublicKey, MOCK_DATA_SIGNATURE, MOCK_DATA);
        expect(result).toBe(true);
    });
    it('returns `false` when a bad signature is supplied for a given payload', async () => {
        expect.assertions(1);
        const badSignature = new Uint8Array(Array(64).fill(1)) as SignatureBytes;
        const result = await verifySignature(mockPublicKey, badSignature, MOCK_DATA);
        expect(result).toBe(false);
    });
    it('returns `false` when the signature 65 bytes long', async () => {
        expect.assertions(1);
        const badSignature = new Uint8Array([...MOCK_DATA_SIGNATURE, 1]) as SignatureBytes;
        const result = await verifySignature(mockPublicKey, badSignature, MOCK_DATA);
        expect(result).toBe(false);
    });
    it('returns `false` when the signature 63 bytes long', async () => {
        expect.assertions(1);
        const badSignature = MOCK_DATA_SIGNATURE.slice(0, 63) as SignatureBytes;
        const result = await verifySignature(mockPublicKey, badSignature, MOCK_DATA);
        expect(result).toBe(false);
    });
});
