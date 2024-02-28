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
import { getPublicKeyAsync, signAsync, utils, verifyAsync } from '@noble/ed25519';

const PROHIBITED_KEY_USAGES = new Set<KeyUsage>([
    'decrypt',
    'deriveBits',
    'deriveKey',
    'encrypt',
    'unwrapKey',
    'wrapKey',
]);

const ED25519_PKCS8_HEADER =
    // prettier-ignore
    [
        /**
         * PKCS#8 header
         */
        0x30, // ASN.1 sequence tag
        0x2e, // Length of sequence (46 more bytes)

            0x02, // ASN.1 integer tag
            0x01, // Length of integer
                0x00, // Version number

            0x30, // ASN.1 sequence tag
            0x05, // Length of sequence
                0x06, // ASN.1 object identifier tag
                0x03, // Length of object identifier
                    // Edwards curve algorithms identifier https://oid-rep.orange-labs.fr/get/1.3.101.112
                        0x2b, // iso(1) / identified-organization(3) (The first node is multiplied by the decimal 40 and the result is added to the value of the second node)
                        0x65, // thawte(101)
                    // Ed25519 identifier
                        0x70, // id-Ed25519(112)

        /**
         * Private key payload
         */
        0x04, // ASN.1 octet string tag
        0x22, // String length (34 more bytes)

            // Private key bytes as octet string
            0x04, // ASN.1 octet string tag
            0x20, // String length (32 bytes)
    ];

function bufferSourceToUint8Array(data: BufferSource): Uint8Array {
    return data instanceof Uint8Array ? data : new Uint8Array(ArrayBuffer.isView(data) ? data.buffer : data);
}

let storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT: WeakMap<CryptoKey, Uint8Array> | undefined;

// Map of public key bytes. These are the result of calling `getPublicKey`
let publicKeyBytesStore: WeakMap<CryptoKey, Uint8Array> | undefined;

function createKeyPairFromBytes(
    bytes: Uint8Array,
    extractable: boolean,
    keyUsages: readonly KeyUsage[],
): CryptoKeyPair {
    const keyPair = createKeyPair_INTERNAL_ONLY_DO_NOT_EXPORT(extractable, keyUsages);
    const cache = (storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT ||= new WeakMap());
    cache.set(keyPair.privateKey, bytes);
    cache.set(keyPair.publicKey, bytes);
    return keyPair;
}

function createKeyPair_INTERNAL_ONLY_DO_NOT_EXPORT(
    extractable: boolean,
    keyUsages: readonly KeyUsage[],
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
        throw new Error('Could not find secret key material associated with this `CryptoKey`');
    }
    return secretKeyBytes;
}

async function getPublicKeyBytes(key: CryptoKey): Promise<Uint8Array> {
    // Try to find the key in the public key store first
    const publicKeyStore = (publicKeyBytesStore ||= new WeakMap());
    const fromPublicStore = publicKeyStore.get(key);
    if (fromPublicStore) return fromPublicStore;

    // If not available, get the key from the secrets store instead
    const publicKeyBytes = await getPublicKeyAsync(getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(key));

    // Store the public key bytes in the public key store for next time
    publicKeyStore.set(key, publicKeyBytes);
    return publicKeyBytes;
}

export async function exportKeyPolyfill(format: 'jwk', key: CryptoKey): Promise<JsonWebKey>;
export async function exportKeyPolyfill(format: KeyFormat, key: CryptoKey): Promise<ArrayBuffer>;
export async function exportKeyPolyfill(format: KeyFormat, key: CryptoKey): Promise<ArrayBuffer | JsonWebKey> {
    if (key.extractable === false) {
        throw new DOMException('key is not extractable', 'InvalidAccessException');
    }
    switch (format) {
        case 'raw': {
            if (key.type !== 'public') {
                throw new DOMException(`Unable to export a raw Ed25519 ${key.type} key`, 'InvalidAccessError');
            }
            const publicKeyBytes = await getPublicKeyBytes(key);
            return publicKeyBytes;
        }
        case 'pkcs8': {
            if (key.type !== 'private') {
                throw new DOMException(`Unable to export a pkcs8 Ed25519 ${key.type} key`, 'InvalidAccessError');
            }
            const secretKeyBytes = getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(key);
            return new Uint8Array([...ED25519_PKCS8_HEADER, ...secretKeyBytes]);
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
    const privateKeyBytes = utils.randomPrivateKey();
    const keyPair = createKeyPairFromBytes(privateKeyBytes, extractable, keyUsages);
    return keyPair;
}

export function isPolyfilledKey(key: CryptoKey): boolean {
    return !!storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT?.has(key) || !!publicKeyBytesStore?.has(key);
}

export async function signPolyfill(key: CryptoKey, data: BufferSource): Promise<ArrayBuffer> {
    if (key.type !== 'private' || !key.usages.includes('sign')) {
        throw new DOMException('Unable to use this key to sign', 'InvalidAccessError');
    }
    const privateKeyBytes = getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(key);
    const payload = bufferSourceToUint8Array(data);
    const signature = await signAsync(payload, privateKeyBytes);
    return signature;
}

export async function verifyPolyfill(key: CryptoKey, signature: BufferSource, data: BufferSource): Promise<boolean> {
    if (key.type !== 'public' || !key.usages.includes('verify')) {
        throw new DOMException('Unable to use this key to verify', 'InvalidAccessError');
    }
    const publicKeyBytes = await getPublicKeyBytes(key);
    try {
        return await verifyAsync(bufferSourceToUint8Array(signature), bufferSourceToUint8Array(data), publicKeyBytes);
    } catch {
        return false;
    }
}

export function importKeyPolyfill(
    format: KeyFormat,
    keyData: BufferSource,
    extractable: boolean,
    keyUsages: readonly KeyUsage[],
): CryptoKey {
    const bytes = bufferSourceToUint8Array(keyData);

    if (format === 'raw') {
        if (keyUsages.some(usage => usage === 'sign' || PROHIBITED_KEY_USAGES.has(usage))) {
            throw new DOMException('Unsupported key usage for a Ed25519 key', 'SyntaxError');
        }
        if (bytes.length !== 32) {
            throw new DOMException('Ed25519 raw keys must be exactly 32-bytes', 'DataError');
        }
        const publicKey = {
            [Symbol.toStringTag]: 'CryptoKey',
            algorithm: Object.freeze({ name: 'Ed25519' }),
            extractable,
            type: 'public',
            usages: Object.freeze(keyUsages.filter(usage => usage === 'verify')) as KeyUsage[],
        } as CryptoKey;

        const cache = (publicKeyBytesStore ||= new WeakMap());
        cache.set(publicKey, bytes);

        return publicKey;
    }

    if (format === 'pkcs8') {
        if (keyUsages.some(usage => usage === 'verify' || PROHIBITED_KEY_USAGES.has(usage))) {
            throw new DOMException('Unsupported key usage for a Ed25519 key', 'SyntaxError');
        }
        // 48 bytes: 16-byte PKCS8 header + 32 byte secret key
        if (bytes.length !== 48) {
            throw new DOMException('Invalid keyData', 'DataError');
        }
        // Must start with exactly the Ed25519 pkcs8 header
        const header = bytes.slice(0, 16);
        if (!header.every((val, i) => val === ED25519_PKCS8_HEADER[i])) {
            throw new DOMException('Invalid keyData', 'DataError');
        }
        const secretKeyBytes = bytes.slice(16);

        const privateKey = {
            [Symbol.toStringTag]: 'CryptoKey',
            algorithm: Object.freeze({ name: 'Ed25519' }),
            extractable,
            type: 'private',
            usages: Object.freeze(keyUsages.filter(usage => usage === 'sign')) as KeyUsage[],
        } as CryptoKey;

        const cache = (storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT ||= new WeakMap());
        cache.set(privateKey, secretKeyBytes);

        return privateKey;
    }

    throw new Error(`Importing Ed25519 keys in the "${format}" format is unimplemented`);
}
