import { SOLANA_ERROR__SUBTLE_CRYPTO__CANNOT_EXPORT_NON_EXTRACTABLE_KEY, SolanaError } from '@solana/errors';

import { createPrivateKeyFromBytes } from '../private-key';
import { getPublicKeyFromPrivateKey } from '../public-key';

const MOCK_PRIVATE_KEY_BYTES = new Uint8Array([
    0xeb, 0xfa, 0x65, 0xeb, 0x93, 0xdc, 0x79, 0x15, 0x7a, 0xba, 0xde, 0xa2, 0xf7, 0x94, 0x37, 0x9d, 0xfc, 0x07, 0x1d,
    0x68, 0x86, 0x87, 0x37, 0x6d, 0xc5, 0xd5, 0xa0, 0x54, 0x12, 0x1d, 0x34, 0x4a,
]);

const EXPECTED_MOCK_PUBLIC_KEY_BYTES = new Uint8Array([
    0x1d, 0x0e, 0x93, 0x86, 0x4d, 0xcc, 0x81, 0x5f, 0xc3, 0xf2, 0x86, 0x18, 0x09, 0x11, 0xd0, 0x0a, 0x3f, 0xd2, 0x06,
    0xde, 0x31, 0xa1, 0xc9, 0x42, 0x87, 0xcb, 0x43, 0xf0, 0x5f, 0xc9, 0xf2, 0xb5,
]);

describe('getPublicKeyFromPrivateKey', () => {
    describe('given an extractable private key', () => {
        let privateKey: CryptoKey;
        beforeEach(async () => {
            privateKey = await createPrivateKeyFromBytes(MOCK_PRIVATE_KEY_BYTES, true);
        });
        it('gets the associated public key', async () => {
            expect.assertions(1);
            const publicKey = await getPublicKeyFromPrivateKey(privateKey, true);
            const publicKeyBytes = new Uint8Array(await crypto.subtle.exportKey('raw', publicKey));
            expect(publicKeyBytes).toEqual(EXPECTED_MOCK_PUBLIC_KEY_BYTES);
        });
        it('can get an extractable public key', async () => {
            expect.assertions(1);
            const publicKey = await getPublicKeyFromPrivateKey(privateKey, true);
            expect(publicKey.extractable).toBe(true);
        });
        it('can get a non-extractable public key', async () => {
            expect.assertions(1);
            const publicKey = await getPublicKeyFromPrivateKey(privateKey, false);
            expect(publicKey.extractable).toBe(false);
        });
        it('returns a non-extractable public key by default', async () => {
            expect.assertions(1);
            const publicKey = await getPublicKeyFromPrivateKey(privateKey);
            expect(publicKey.extractable).toBe(false);
        });
    });
    describe('given a non-extractable private key', () => {
        let privateKey: CryptoKey;
        beforeEach(async () => {
            privateKey = await createPrivateKeyFromBytes(MOCK_PRIVATE_KEY_BYTES, false);
        });
        it('cannot get the associated public key', async () => {
            expect.assertions(1);
            await expect(() => getPublicKeyFromPrivateKey(privateKey, true)).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__SUBTLE_CRYPTO__CANNOT_EXPORT_NON_EXTRACTABLE_KEY, { key: privateKey }),
            );
        });
    });
});
