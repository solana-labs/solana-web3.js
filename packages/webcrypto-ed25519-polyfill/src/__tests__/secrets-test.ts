import { generateKeyPolyfill } from '../secrets';

describe('generateKeyPolyfill', () => {
    it('stores secret key bytes in an internal cache', () => {
        const weakMapSetSpy = jest.spyOn(WeakMap.prototype, 'set');
        const expectedSecretKey = new Uint8Array(Array(32).fill(1));
        jest.spyOn(globalThis.crypto, 'getRandomValues').mockReturnValue(expectedSecretKey);
        generateKeyPolyfill(/* extractable */ false, ['sign', 'verify']);
        expect(weakMapSetSpy).toHaveBeenCalledWith(expect.anything(), expectedSecretKey);
    });
    describe.each(['public', 'private'])('when generating a %s key', type => {
        let keyPair: CryptoKeyPair;
        beforeEach(() => {
            keyPair = generateKeyPolyfill(/* extractable */ false, ['sign', 'verify']);
        });
        it(`has the algorithm "Ed25519"`, () => {
            expect(keyPair).toHaveProperty([`${type}Key`, 'algorithm', 'name'], 'Ed25519');
        });
        it('has the string tag "CryptoKey"', () => {
            expect(keyPair).toHaveProperty([`${type}Key`, Symbol.toStringTag], 'CryptoKey');
        });
        it(`has the type "${type}"`, () => {
            expect(keyPair).toHaveProperty([`${type}Key`, 'type'], type);
        });
    });
    it.each([true, false])(
        "sets the private key's `extractable` to `false` when generating a key pair with the extractability `%s`",
        extractable => {
            const { privateKey } = generateKeyPolyfill(extractable, ['sign', 'verify']);
            expect(privateKey).toHaveProperty('extractable', extractable);
        }
    );
    it.each([true, false])(
        "sets the public key's `extractable` to `true` when generating a key pair with the extractability `%s`",
        extractable => {
            const { publicKey } = generateKeyPolyfill(extractable, ['sign', 'verify']);
            expect(publicKey).toHaveProperty('extractable', true);
        }
    );
    it.each(['decrypt', 'deriveBits', 'deriveKey', 'encrypt', 'unwrapKey', 'wrapKey'] as KeyUsage[])(
        'fatals when the usage `%s` is specified',
        usage => {
            expect(() => generateKeyPolyfill(/* extractable */ false, [usage])).toThrow();
        }
    );
    it("includes `sign` among the private key's usages when the `sign` usage is specified", () => {
        const { privateKey } = generateKeyPolyfill(/* extractable */ false, ['sign']);
        expect(privateKey).toHaveProperty('usages', expect.arrayContaining(['sign']));
    });
    it("sets the private key's usages to an empty array when the `sign` usage is not specified", () => {
        const { privateKey } = generateKeyPolyfill(/* extractable */ false, ['verify']);
        expect(privateKey).toHaveProperty('usages', []);
    });
    it("does not include `verify` among the private key's usages when the `verify` usage is specified", () => {
        const { privateKey } = generateKeyPolyfill(/* extractable */ false, ['verify']);
        expect(privateKey).toHaveProperty('usages', []);
    });
    it("does not include `sign` among the public key's usages when the `sign` usage is specified", () => {
        const { publicKey } = generateKeyPolyfill(/* extractable */ false, ['sign']);
        expect(publicKey).toHaveProperty('usages', []);
    });
    it("sets the public key's usages to an empty array when the `verify` usage is not specified", () => {
        const { publicKey } = generateKeyPolyfill(/* extractable */ false, ['sign']);
        expect(publicKey).toHaveProperty('usages', []);
    });
    it("includes `verify` among the public key's usages when the `verify` usage is specified", () => {
        const { publicKey } = generateKeyPolyfill(/* extractable */ false, ['verify']);
        expect(publicKey).toHaveProperty('usages', expect.arrayContaining(['verify']));
    });
    it('fatals when no key usages are specified', () => {
        expect(() => generateKeyPolyfill(/* extractable */ false, [])).toThrow();
    });
    describe('when no CSPRNG can be found', () => {
        let oldGetRandomValues: Crypto['getRandomValues'];
        beforeEach(() => {
            oldGetRandomValues = globalThis.crypto.getRandomValues;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            globalThis.crypto.getRandomValues = undefined;
        });
        afterEach(() => {
            globalThis.crypto.getRandomValues = oldGetRandomValues;
        });
        it('fatals', () => {
            expect(() => {
                generateKeyPolyfill(/* extractable */ false, ['sign', 'verify']);
            }).toThrow();
        });
    });
});
