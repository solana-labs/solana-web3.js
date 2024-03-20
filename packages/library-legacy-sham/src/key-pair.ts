import { etc, getPublicKey, utils } from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { getAddressDecoder } from '@solana/addresses';

import { PublicKey } from './public-key.js';
import { createUnimplementedFunction } from './unimplemented.js';

export class Keypair {
    #cachedPublicKey: PublicKey | undefined;
    #cachedPublicKeyBytes: Uint8Array | undefined;
    #secretKeyBytes: Uint8Array;
    constructor(keypair?: {
        publicKey: Uint8Array;
        /**
         * A 64 byte secret key, the first 32 bytes of which is the
         * private scalar and the last 32 bytes is the public key.
         * Read more: https://blog.mozilla.org/warner/2011/11/29/ed25519-keys/
         */
        secretKey: Uint8Array;
    }) {
        if (keypair) {
            this.#secretKeyBytes = keypair.secretKey.slice(0, 32);
        } else {
            this.#secretKeyBytes = this.#generateSecretKeyBytes();
        }
    }
    get #publicKeyBytes() {
        if (!this.#cachedPublicKeyBytes) {
            if (!etc.sha512Sync) {
                etc.sha512Sync = (...m) => sha512(etc.concatBytes(...m));
            }
            this.#cachedPublicKeyBytes = getPublicKey(this.#secretKeyBytes);
        }
        return this.#cachedPublicKeyBytes;
    }
    #generateSecretKeyBytes() {
        return utils.randomPrivateKey();
    }
    get _keypair() {
        throw new Error(
            'This error is being thrown from `@solana/web3.js-legacy-sham`. The legacy ' +
                'implementation of `Keypair` historically exposed the internal property ' +
                '`_keypair` but the sham does not. Please eliminate this access of `_keypair` ' +
                'and replace it with an implementation that makes use of the available public ' +
                'methods.',
        );
    }
    get publicKey(): PublicKey {
        if (!this.#cachedPublicKey) {
            const publicKeyBytes = this.#publicKeyBytes;
            const address = getAddressDecoder().decode(publicKeyBytes);
            this.#cachedPublicKey = new PublicKey(address);
        }
        return this.#cachedPublicKey;
    }
    get secretKey(): Uint8Array {
        return new Uint8Array([...this.#secretKeyBytes, ...this.#publicKeyBytes]);
    }
    static fromSecretKey = createUnimplementedFunction('Keypair#fromSecretKey');
    static fromSeed = createUnimplementedFunction('Keypair#fromSeed');
    static generate() {
        return new Keypair();
    }
}
