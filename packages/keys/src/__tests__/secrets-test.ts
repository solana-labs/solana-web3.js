import { Base58EncodedAddress } from '../base58';
import { generateSecretKey, getPublicKeyFromSecretKey } from '../secrets';

describe('generateSecretKey', () => {
    it('stores a new key in an internal cache', () => {
        const weakMapSetSpy = jest.spyOn(WeakMap.prototype, 'set');
        const expectedSecretKey = new Uint8Array(Array(32).fill(1));
        jest.spyOn(globalThis.crypto, 'getRandomValues').mockReturnValue(expectedSecretKey);
        generateSecretKey();
        expect(weakMapSetSpy).toHaveBeenCalledWith(expect.anything(), expectedSecretKey);
    });
    describe('when no crypto module can be found', () => {
        let oldCrypto: Crypto;
        beforeEach(() => {
            oldCrypto = globalThis.crypto;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            delete globalThis.crypto;
        });
        afterEach(() => {
            globalThis.crypto = oldCrypto;
        });
        it('fatals', () => {
            expect(() => {
                generateSecretKey();
            }).toThrow();
        });
    });
    describe('when `WeakMap` supports symbols as keys', () => {
        let generateSecretKey: typeof import('../secrets').generateSecretKey;
        beforeEach(async () => {
            await jest.isolateModulesAsync(async () => {
                generateSecretKey =
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    (await import('../secrets')).generateSecretKey;
            });
            const storage = new Map();
            jest.spyOn(globalThis.WeakMap.prototype, 'set').mockImplementation(function (
                this: WeakMap<object, unknown>,
                key: object | symbol,
                value: unknown
            ) {
                storage.set(key, value);
                return this;
            });
            jest.spyOn(globalThis.WeakMap.prototype, 'get').mockImplementation(function (key: object | symbol) {
                return storage.get(key);
            });
        });
        it('returns a symbol', () => {
            const secretKey = generateSecretKey();
            expect(secretKey).toEqual(expect.any(Symbol));
        });
        it('labels the symbol in dev mode', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = true;
            const secretKey = generateSecretKey();
            expect(secretKey.toString()).toMatch(/Symbol\(SecretKey\(\d+\)\)/);
        });
        it('does not label the symbol in non-dev mode', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = false;
            const secretKey = generateSecretKey();
            expect(secretKey.toString()).toMatch(`Symbol()`);
        });
    });
    describe('when `WeakMap` does not support symbols as keys', () => {
        let generateSecretKey: typeof import('../secrets').generateSecretKey;
        beforeEach(async () => {
            await jest.isolateModulesAsync(async () => {
                generateSecretKey =
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    (await import('../secrets')).generateSecretKey;
            });
            jest.spyOn(globalThis.WeakMap.prototype, 'set').mockImplementation(function (
                this: WeakMap<object, unknown>,
                key: object | symbol,
                _value: unknown
            ) {
                if (typeof key === 'symbol') {
                    throw new Error();
                }
                return this;
            });
        });
        it('returns an object', () => {
            const secretKey = generateSecretKey();
            expect(secretKey).toEqual(expect.any(Object));
        });
        it('labels the object in dev mode', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = true;
            const secretKey = generateSecretKey();
            expect(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                secretKey['\u{1f5dd}']
            ).toMatch('1');
        });
        it("does not allow you to override the object's label in dev mode", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = true;
            const secretKey = generateSecretKey();
            expect(() => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                secretKey['\u{1f5dd}'] = 123;
            }).toThrow();
        });
        it('does not label the object in non-dev mode', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = false;
            const secretKey = generateSecretKey();
            expect(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                secretKey['\u{1f5dd}']
            ).toBeUndefined();
        });
        it("does not allow you to override the object's label in non-dev mode", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = false;
            const secretKey = generateSecretKey();
            expect(() => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                secretKey['\u{1f5dd}'] = 123;
            }).toThrow();
        });
    });
});

describe('getPublicKeyFromSecretKey', () => {
    it('returns the public key that corresponds to a given secret key', () => {
        const secretKeyBytes = new Uint8Array([
            83, 147, 250, 112, 140, 37, 29, 73, 156, 38, 185, 76, 163, 8, 178, 225, 172, 53, 120, 108, 127, 191, 103, 8,
            160, 170, 183, 186, 246, 1, 227, 158,
        ]);
        jest.spyOn(globalThis.crypto, 'getRandomValues').mockReturnValue(secretKeyBytes);
        const secretKey = generateSecretKey();
        expect(getPublicKeyFromSecretKey(secretKey)).toBe(
            'CD1pJqV9a6YUrpGyXj7oDnHEYcKDigKD4rVG6B4dGTcf' as Base58EncodedAddress<'CD1pJqV9a6YUrpGyXj7oDnHEYcKDigKD4rVG6B4dGTcf'>
        );
    });
});
