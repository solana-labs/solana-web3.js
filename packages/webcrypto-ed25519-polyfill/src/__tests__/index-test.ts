import { generateKeyPolyfill } from '../secrets';

jest.mock('../secrets');

describe('generateKey() polyfill', () => {
    let oldIsSecureContext: boolean;
    let originalGenerateKey: SubtleCrypto['generateKey'];
    beforeEach(() => {
        jest.spyOn(globalThis.crypto?.subtle, 'generateKey');
        originalGenerateKey = globalThis.crypto?.subtle?.generateKey;
        if (__BROWSER__) {
            // FIXME: JSDOM does not set `isSecureContext` or otherwise allow you to configure it.
            // Some discussion: https://github.com/jsdom/jsdom/issues/2751#issuecomment-846613392
            if (globalThis.isSecureContext !== undefined) {
                oldIsSecureContext = globalThis.isSecureContext;
            }
        }
        globalThis.isSecureContext = true;
    });
    afterEach(() => {
        globalThis.crypto.subtle.generateKey = originalGenerateKey;
        if (oldIsSecureContext !== undefined) {
            globalThis.isSecureContext = oldIsSecureContext;
        }
    });
    describe('when required in an environment with no `generateKey` function', () => {
        beforeEach(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            globalThis.crypto.subtle.generateKey = undefined;
            jest.isolateModules(() => {
                require('../index');
            });
        });
        afterEach(() => {
            globalThis.crypto.subtle.generateKey = originalGenerateKey;
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
                        } as RsaHashedKeyGenParams)
                )
            ),
        ])('fatals when the algorithm is $name/$__variant', async algorithm => {
            expect.assertions(1);
            await expect(() =>
                globalThis.crypto.subtle.generateKey(algorithm, /* extractable */ false, ['sign', 'verify'])
            ).rejects.toThrow();
        });
        it('delegates Ed25519 `generateKey` calls to the polyfill', async () => {
            expect.assertions(1);
            const mockKeyPair = {};
            (generateKeyPolyfill as jest.Mock).mockReturnValue(mockKeyPair);
            const keyPair = await globalThis.crypto.subtle.generateKey('Ed25519', /* extractable */ false, [
                'sign',
                'verify',
            ]);
            expect(keyPair).toBe(mockKeyPair);
        });
    });
    describe('when required in an environment that does not support Ed25519', () => {
        beforeEach(() => {
            const originalGenerateKeyImpl = originalGenerateKey;
            (originalGenerateKey as jest.Mock).mockImplementation(async (...args) => {
                const [algorithm] = args;
                if (algorithm === 'Ed25519') {
                    throw new Error('Ed25519 not supported');
                }
                return await originalGenerateKeyImpl.apply(globalThis.crypto.subtle, args);
            });
            jest.isolateModules(() => {
                require('../index');
            });
        });
        it('calls the original `generateKey` once as a test when the algorithm is "Ed25519" but never again (parallel version)', async () => {
            expect.assertions(1);
            await Promise.all([
                globalThis.crypto.subtle.generateKey('Ed25519', /* extractable */ false, ['sign', 'verify']),
                globalThis.crypto.subtle.generateKey('Ed25519', /* extractable */ false, ['sign', 'verify']),
            ]);
            expect(originalGenerateKey).toHaveBeenCalledTimes(1);
        });
        it('calls the original `generateKey` once as a test when the algorithm is "Ed25519" but never again (serial version)', async () => {
            expect.assertions(1);
            await globalThis.crypto.subtle.generateKey('Ed25519', /* extractable */ false, ['sign', 'verify']);
            await globalThis.crypto.subtle.generateKey('Ed25519', /* extractable */ false, ['sign', 'verify']);
            expect(originalGenerateKey).toHaveBeenCalledTimes(1);
        });
        it('delegates Ed25519 `generateKey` calls to the polyfill', async () => {
            expect.assertions(1);
            const mockKeyPair = {};
            (generateKeyPolyfill as jest.Mock).mockReturnValue(mockKeyPair);
            const keyPair = await globalThis.crypto.subtle.generateKey('Ed25519', /* extractable */ false, [
                'sign',
                'verify',
            ]);
            expect(keyPair).toBe(mockKeyPair);
        });
    });
    describe('when required in an environment that supports Ed25519', () => {
        beforeEach(() => {
            jest.isolateModules(() => {
                require('../index');
            });
        });
        it('overrides `generateKey`', () => {
            expect(globalThis.crypto.subtle.generateKey).not.toBe(originalGenerateKey);
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
                        } as RsaHashedKeyGenParams)
                )
            ),
        ])('calls the original `generateKey` when the algorithm is $name/$__variant', async algorithm => {
            expect.assertions(1);
            await globalThis.crypto.subtle.generateKey(algorithm, /* extractable */ false, ['sign', 'verify']);
            expect(originalGenerateKey).toHaveBeenCalled();
        });
        it('delegates the call to the original `generateKey` when the algorithm is "Ed25519"', async () => {
            expect.assertions(1);
            const mockKeyPair = {};
            (originalGenerateKey as jest.Mock).mockResolvedValue(mockKeyPair);
            await expect(
                globalThis.crypto.subtle.generateKey('Ed25519', /* extractable */ false, ['sign', 'verify'])
            ).resolves.toBe(mockKeyPair);
        });
        it('calls the original `generateKey` once per call to `generateKey` when the algorithm is "Ed25519" (parallel version)', async () => {
            expect.assertions(1);
            await Promise.all([
                globalThis.crypto.subtle.generateKey('Ed25519', /* extractable */ false, ['sign', 'verify']),
                globalThis.crypto.subtle.generateKey('Ed25519', /* extractable */ false, ['sign', 'verify']),
            ]);
            expect(originalGenerateKey).toHaveBeenCalledTimes(2);
        });
        it('calls the original `generateKey` once per call to `generateKey` when the algorithm is "Ed25519" (serial version)', async () => {
            expect.assertions(1);
            await globalThis.crypto.subtle.generateKey('Ed25519', /* extractable */ false, ['sign', 'verify']);
            await globalThis.crypto.subtle.generateKey('Ed25519', /* extractable */ false, ['sign', 'verify']);
            expect(originalGenerateKey).toHaveBeenCalledTimes(2);
        });
        it('does not delegate `generateKey` calls to the polyfill', async () => {
            expect.assertions(1);
            await globalThis.crypto.subtle.generateKey('Ed25519', /* extractable */ false, ['sign', 'verify']);
            expect(generateKeyPolyfill).not.toHaveBeenCalled();
        });
    });
    describe('when required in an insecure context', () => {
        beforeEach(() => {
            globalThis.isSecureContext = false;
            jest.isolateModules(() => {
                require('../index');
            });
        });
        if (__BROWSER__) {
            it('does not override `generateKey`', () => {
                expect(globalThis.crypto.subtle.generateKey).toBe(originalGenerateKey);
            });
        } else {
            it('overrides `generateKey`', () => {
                expect(globalThis.crypto.subtle.generateKey).not.toBe(originalGenerateKey);
            });
        }
    });
});
