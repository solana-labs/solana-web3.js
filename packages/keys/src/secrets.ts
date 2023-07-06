/**
 *      HEY!   <== SECRET KEY KOALA
 *      |/     <== WOULD LIKE YOUR
 *   ʕ·͡ᴥ·ʔ     <== ATTENTION PLEASE
 *
 * Key material generated in this module must stay in this module. So long as the secrets cache and
 * the internal methods that interact with it are not exported from `@solana/keys`, accidental
 * logging of the actual bytes of a secret key (eg. to the console, or to a remote server) should
 * not be possible.
 *
 * WARNING: This does not imply that the secrets cache is secure against supply-chain attacks.
 * Untrusted code in your JavaScript context can easily override `WeakMap.prototype.set` to steal
 * private keys as they are written to the cache, without alerting you to its presence or affecting
 * the regular operation of the cache.
 */
import { ed25519 } from '@noble/curves/ed25519';

import { Base58EncodedAddress, getBase58EncodedAddressCodec } from './base58';

type SecretKey = symbol & { readonly __secretKey: unique symbol };

const KEY_GLYPH = '\u{1f5dd}';

let storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT: WeakMap<SecretKey, Uint8Array> | undefined;
function createSecretKeyFromBytes(bytes: Uint8Array): SecretKey {
    const key = createSecretKey_INTERNAL_ONLY_DO_NOT_EXPORT();
    const cache = (storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT ||= new WeakMap());
    cache.set(key, bytes);
    return key;
}

let nextSequenceNumber = 0n;
function createSecretKey_INTERNAL_ONLY_DO_NOT_EXPORT(): SecretKey {
    const shouldUseSymbol =
        weakMapSupportsSymbolKeys === undefined
            ? (weakMapSupportsSymbolKeys = getWeakMapSupportsSymbolKeys())
            : weakMapSupportsSymbolKeys;
    let label;
    if (__DEV__) {
        const sequenceNumber = ++nextSequenceNumber;
        label = shouldUseSymbol ? `SecretKey(${sequenceNumber})` : sequenceNumber.toString();
    }
    const key = shouldUseSymbol ? Symbol(label) : Object.create(null, { [KEY_GLYPH]: { value: label } });
    return Object.freeze(key);
}

/**
 * https://github.com/tc39/proposal-symbols-as-weakmap-keys
 */
let weakMapSupportsSymbolKeys: boolean | undefined;
function getWeakMapSupportsSymbolKeys(): boolean {
    try {
        const key = Symbol();
        const storage = new WeakMap();
        const testObject = Object.create(null);
        storage.set(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            key,
            testObject
        );
        if (
            storage.get(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                key
            ) !== testObject
        ) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

/**
 * Given a `SecretKey` object, this function returns the secret bytes associated with it.
 *
 *   |￣￣￣￣￣￣￣￣￣￣￣|
 *   |     DON'T EXPORT     |
 *   |   THIS METHOD FROM   |
 *   |     @solana/keys     |
 *   |＿＿＿＿＿＿＿＿＿＿＿|
 *   (\__/) ||
 *   (•ㅅ•) ||
 *   /    づ
 */
function getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(secretKey: SecretKey): Uint8Array {
    const bytes = storageKeyBySecretKey_INTERNAL_ONLY_DO_NOT_EXPORT?.get(secretKey);
    if (!bytes) {
        // TODO: Coded error.
        throw new Error(
            'Could not find secret key material for ' +
                (typeof secretKey === 'symbol' ? secretKey.toString() : `{${KEY_GLYPH}: "${secretKey[KEY_GLYPH]}"}`)
        );
    }
    return bytes;
}

export function getPublicKeyFromSecretKey(secretKey: SecretKey): Base58EncodedAddress {
    const secretKeyBytes = getSecretKeyBytes_INTERNAL_ONLY_DO_NOT_EXPORT(secretKey);
    const publicKeyBytes = ed25519.getPublicKey(secretKeyBytes);
    const [base58EncodedAddress] = getBase58EncodedAddressCodec().deserialize(publicKeyBytes);
    return base58EncodedAddress;
}

/**
 * This function generates a secret key and stores it in a module-private cache. Instead of vending
 * the actual secret bytes, it returns a unique `SecretKey` symbol that you can use with other
 * methods in this package to produce signatures and derive public keys associate with the secret.
 */
export function generateSecretKey(): SecretKey {
    if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
        // TODO: Coded error.
        throw new Error('No cryptographically secure pseudo-random number generator was found');
    }
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return createSecretKeyFromBytes(bytes);
}
