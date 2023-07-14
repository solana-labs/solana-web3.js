/**
 *      HEY!   <== SECRET KEY KOALA
 *      |/     <== WOULD LIKE YOUR
 *   ʕ·͡ᴥ·ʔ     <== ATTENTION PLEASE
 *
 * Key material generated in this module must stay in this module. So long as the secrets cache and
 * the methods that interact with it are not exported from `@solana/webcrypto-ed25519-polyfill`,
 * accidental logging of the actual bytes of a secret key (eg. to the console, or to a remote
 * server) should not be possible.
 *
 * WARNING: This does not imply that the secrets cache is secure against supply-chain attacks.
 * Untrusted code in your JavaScript context can easily override `WeakMap.prototype.set` to steal
 * private keys as they are written to the cache, without alerting you to its presence or affecting
 * the regular operation of the cache.
 */
import { ed25519 } from '@noble/curves/ed25519';

const PROHIBITED_KEY_USAGES = new Set<KeyUsage>([
    'decrypt',
    'deriveBits',
    'deriveKey',
    'encrypt',
    'unwrapKey',
    'wrapKey',
]);

function bufferSourceToUint8Array(data: BufferSource): Uint8Array {
    return data instanceof Uint8Array ? data : new Uint8Array(ArrayBuffer.isView(data) ? data.buffer : data);
}

let storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT: WeakMap<CryptoKey, Uint8Array> | undefined;
function createKeyPairFromBytes(
    bytes: Uint8Array,
    extractable: boolean,
    keyUsages: readonly KeyUsage[]
): CryptoKeyPair {
    const keyPair = createKeyPair_INTERNAL_ONLY_DO_NOT_EXPORT(extractable, keyUsages);
    const cache = (storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT ||= new WeakMap());
    cache.set(keyPair.privateKey, bytes);
    cache.set(keyPair.publicKey, bytes);
    return keyPair;
}

function createKeyPair_INTERNAL_ONLY_DO_NOT_EXPORT(
    extractable: boolean,
    keyUsages: readonly KeyUsage[]
): CryptoKeyPair {
    if (keyUsages.length === 0) {
        throw new DOMException('Usages cannot be empty when creating a key.', 'SyntaxError');
    }
    if (keyUsages.some(usage => PROHIBITED_KEY_USAGES.has(usage))) {
        throw new DOMException('Unsupported key usage for an Ed25519 key.', 'SyntaxError');
    }
    const base = {
        [Symbol.toStringTag]: 'CryptoKey',
        algorithm: Object.freeze({ name: 'Ed25519' }),
    };
    const privateKey = {
        ...base,
        extractable,
        type: 'private',
        usages: Object.freeze(keyUsages.filter(usage => usage === 'sign')) as KeyUsage[],
    } as CryptoKey;
    const publicKey = {
        ...base,
        extractable: true,
        type: 'public',
        usages: Object.freeze(keyUsages.filter(usage => usage === 'verify')) as KeyUsage[],
    } as CryptoKey;
    return Object.freeze({
        privateKey: Object.freeze(privateKey),
        publicKey: Object.freeze(publicKey),
    });
}

function getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(key: CryptoKey): Uint8Array {
    const secretKeyBytes = storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT?.get(key);
    if (secretKeyBytes === undefined) {
        // TODO: Coded error.
        throw new Error('Could not find secret key material associated with this `CryptoKey`');
    }
    return secretKeyBytes;
}

export function exportKeyPolyfill(format: 'jwk', key: CryptoKey): JsonWebKey;
export function exportKeyPolyfill(format: KeyFormat, key: CryptoKey): ArrayBuffer;
export function exportKeyPolyfill(format: KeyFormat, key: CryptoKey): ArrayBuffer | JsonWebKey {
    switch (format) {
        case 'raw': {
            if (key.extractable === false) {
                throw new DOMException('key is not extractable', 'InvalidAccessException');
            }
            if (key.type !== 'public') {
                throw new DOMException(`Unable to export a raw Ed25519 ${key.type} key`, 'InvalidAccessError');
            }
            const publicKeyBytes = ed25519.getPublicKey(getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(key));
            return publicKeyBytes;
        }
        default:
            throw new Error(`Exporting polyfilled Ed25519 keys in the "${format}" format is unimplemented`);
    }
}

/**
 * This function generates a key pair and stores the secret bytes associated with it in a
 * module-private cache. Instead of vending the actual secret bytes, it returns a `CryptoKeyPair`
 * that you can use with other methods in this package to produce signatures and derive public keys
 * associated with the secret.
 */
export function generateKeyPolyfill(extractable: boolean, keyUsages: readonly KeyUsage[]): CryptoKeyPair {
    const privateKeyBytes = ed25519.utils.randomPrivateKey();
    const keyPair = createKeyPairFromBytes(privateKeyBytes, extractable, keyUsages);
    return keyPair;
}

export function isPolyfilledKey(key: CryptoKey): boolean {
    return !!storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT?.has(key);
}

export function signPolyfill(key: CryptoKey, data: BufferSource): ArrayBuffer {
    if (key.type !== 'private' || !key.usages.includes('sign')) {
        throw new DOMException('Unable to use this key to sign', 'InvalidAccessError');
    }
    const privateKeyBytes = getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(key);
    const payload = bufferSourceToUint8Array(data);
    const signature = ed25519.sign(payload, privateKeyBytes);
    return signature;
}

export function verifyPolyfill(key: CryptoKey, signature: BufferSource, data: BufferSource): boolean {
    if (key.type !== 'public' || !key.usages.includes('verify')) {
        throw new DOMException('Unable to use this key to verify', 'InvalidAccessError');
    }
    const publicKeyBytes = ed25519.getPublicKey(getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(key));
    try {
        return ed25519.verify(bufferSourceToUint8Array(signature), bufferSourceToUint8Array(data), publicKeyBytes);
    } catch {
        return false;
    }
}
