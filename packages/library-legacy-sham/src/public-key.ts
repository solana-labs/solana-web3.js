import { Address, assertIsAddress, getAddressEncoder } from '@solana/addresses';

import { createUnimplementedFunction } from './unimplemented.js';

// FIXME(https://github.com/evanw/esbuild/issues/3500): This should be a private static property.
let defaultPublicKey: PublicKey<'11111111111111111111111111111111'> | undefined;

export class PublicKey<TAddress extends string = string> {
    #address: Address<TAddress>;
    constructor(address: TAddress) {
        assertIsAddress(address);
        this.#address = address;
    }
    #getAddress() {
        return this.#address;
    }
    #getByteArray() {
        return getAddressEncoder().encode(this.#address);
    }
    #getBuffer() {
        if (!__NODEJS__ && typeof Buffer === 'undefined') {
            throw new Error(
                '`PublicKey.getBuffer()` is not implemented in the browser and React Native ' +
                    'builds of `@solana/web3.js-legacy-sham`. You may choose to either:\n\n1. ' +
                    'Modify the code that calls `getBuffer()`/`encode()` to instead call ' +
                    '`toBytes()`, or\n2. Polyfill `globalThis.Buffer`.',
            );
        }
        return Buffer.from(this.#getByteArray());
    }
    encode = this.#getBuffer;
    equals(other: { toBase58: () => string }) {
        return other.toBase58() === this.#address;
    }
    toBase58 = this.#getAddress;
    toBuffer = this.#getBuffer;
    toBytes = this.#getByteArray;
    toJSON = this.#getAddress;
    toString = this.#getAddress;
    get [Symbol.toStringTag]() {
        return `PublicKeySham(${this.#address})`;
    }
    get _bn() {
        throw new Error(
            'This error is being thrown from `@solana/web3.js-legacy-sham`. The legacy ' +
                'implementation of `PublicKey` historically exposed the internal property ' +
                '`_bn` but the sham does not. Please eliminate this access of `_bn` and replace ' +
                'it with an implementation that makes use of the available public methods.',
        );
    }
    static createProgramAddress = createUnimplementedFunction('PublicKey#createProgramAddress');
    static createProgramAddressSync = createUnimplementedFunction('PublicKey#createProgramAddressSync');
    static createWithSeed = createUnimplementedFunction('PublicKey#createWithSeed');
    static decode = createUnimplementedFunction('PublicKey#decode');
    static decodeUnchecked = createUnimplementedFunction('PublicKey#decodeUnchecked');
    static get default() {
        if (!defaultPublicKey) {
            defaultPublicKey = new PublicKey('11111111111111111111111111111111');
        }
        return defaultPublicKey;
    }
    static isOnCurve = createUnimplementedFunction('PublicKey#isOnCurve');
    static findProgramAddress = createUnimplementedFunction('PublicKey#findProgramAddress');
    static findProgramAddressSync = createUnimplementedFunction('PublicKey#findProgramAddressSync');
    static unique = createUnimplementedFunction('PublicKey#unique');
}
