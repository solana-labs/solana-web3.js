import {
    SOLANA_ERROR__KEYS__INVALID_KEY_PAIR_BYTE_LENGTH,
    SOLANA_ERROR__KEYS__PUBLIC_KEY_MUST_MATCH_PRIVATE_KEY,
    SolanaError,
} from '@solana/errors';

import { createKeyPairFromBytes, generateKeyPair } from '../key-pair';

const MOCK_KEY_BYTES = new Uint8Array([
    0xeb, 0xfa, 0x65, 0xeb, 0x93, 0xdc, 0x79, 0x15, 0x7a, 0xba, 0xde, 0xa2, 0xf7, 0x94, 0x37, 0x9d, 0xfc, 0x07, 0x1d,
    0x68, 0x86, 0x87, 0x37, 0x6d, 0xc5, 0xd5, 0xa0, 0x54, 0x12, 0x1d, 0x34, 0x4a, 0x1d, 0x0e, 0x93, 0x86, 0x4d, 0xcc,
    0x81, 0x5f, 0xc3, 0xf2, 0x86, 0x18, 0x09, 0x11, 0xd0, 0x0a, 0x3f, 0xd2, 0x06, 0xde, 0x31, 0xa1, 0xc9, 0x42, 0x87,
    0xcb, 0x43, 0xf0, 0x5f, 0xc9, 0xf2, 0xb5,
]);

const MOCK_INVALID_KEY_BYTES = new Uint8Array([
    0xeb, 0xfa, 0x65, 0xeb, 0x93, 0xdc, 0x79, 0x15, 0x7a, 0xba, 0xde, 0xa2, 0xf7, 0x94, 0x37, 0x9d, 0xfc, 0x07, 0x1d,
    0x68, 0x86, 0x87, 0x37, 0x6d, 0xc5, 0xd5, 0xa0, 0x54, 0x12, 0x1d, 0x34, 0x4a, 0x1d, 0x0e, 0x93, 0x86, 0x4d, 0xcc,
    0x81, 0x5f, 0xc3, 0xf2, 0x86, 0x18, 0x09, 0x11, 0xd0, 0x0a, 0x3f, 0xd2, 0x06, 0xde, 0x31, 0xa1, 0xc9, 0x42, 0x87,
    0xcb, 0x43, 0xf0, 0x5f, 0xc9, 0xf2, 0xb1,
]);

describe('key-pair', () => {
    describe('generateKeyPair', () => {
        it.each(['private', 'public'])('generates an ed25519 %s `CryptoKey`', async type => {
            expect.assertions(1);
            const keyPair = await generateKeyPair();
            expect(keyPair).toMatchObject({
                [`${type}Key`]: expect.objectContaining({
                    [Symbol.toStringTag]: 'CryptoKey',
                    algorithm: { name: 'Ed25519' },
                    type,
                }),
            });
        });
        it('generates a non-extractable private key', async () => {
            expect.assertions(1);
            const { privateKey } = await generateKeyPair();
            expect(privateKey).toHaveProperty('extractable', false);
        });
        it('generates a private key usable for signing operations', async () => {
            expect.assertions(1);
            const { privateKey } = await generateKeyPair();
            expect(privateKey).toHaveProperty('usages', ['sign']);
        });
        it('generates an extractable public key', async () => {
            expect.assertions(1);
            const { publicKey } = await generateKeyPair();
            expect(publicKey).toHaveProperty('extractable', true);
        });
        it('generates a public key usable for verifying signatures', async () => {
            expect.assertions(1);
            const { publicKey } = await generateKeyPair();
            expect(publicKey).toHaveProperty('usages', ['verify']);
        });
    });

    describe('createKeyPairFromBytes', () => {
        it('creates a key pair from a 64-byte array', async () => {
            expect.assertions(1);
            const keyPair = await createKeyPairFromBytes(MOCK_KEY_BYTES);
            expect(keyPair).toMatchObject({
                privateKey: expect.objectContaining({
                    [Symbol.toStringTag]: 'CryptoKey',
                    algorithm: { name: 'Ed25519' },
                    type: 'private',
                }),
                publicKey: expect.objectContaining({
                    [Symbol.toStringTag]: 'CryptoKey',
                    algorithm: { name: 'Ed25519' },
                    type: 'public',
                }),
            });
        });
        it('errors when the byte array is not 64 bytes', async () => {
            expect.assertions(1);
            await expect(createKeyPairFromBytes(MOCK_KEY_BYTES.slice(0, 31))).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__KEYS__INVALID_KEY_PAIR_BYTE_LENGTH, { byteLength: 31 }),
            );
        });
        it('errors when public key fails signature verification', async () => {
            expect.assertions(1);
            await expect(createKeyPairFromBytes(MOCK_INVALID_KEY_BYTES)).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__KEYS__PUBLIC_KEY_MUST_MATCH_PRIVATE_KEY),
            );
        });
    });
});
