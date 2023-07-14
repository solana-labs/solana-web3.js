import { generateKeyPair } from '../key-pair';

describe('generateKeyPair', () => {
    let oldIsSecureContext: boolean;
    beforeEach(() => {
        if (__BROWSER__) {
            // FIXME: JSDOM does not set `isSecureContext` or otherwise allow you to configure it.
            // Some discussion: https://github.com/jsdom/jsdom/issues/2751#issuecomment-846613392
            if (globalThis.isSecureContext !== undefined) {
                oldIsSecureContext = globalThis.isSecureContext;
            }
            globalThis.isSecureContext = true;
        }
    });
    afterEach(() => {
        if (oldIsSecureContext !== undefined) {
            globalThis.isSecureContext = oldIsSecureContext;
        }
    });
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
