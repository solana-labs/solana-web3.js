import {
    etc,
    ExtendedPoint,
    getPublicKey as getPublicKeyImpl,
    sign as signImpl,
    utils,
    verify as verifyImpl,
} from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import cryptoImpl from 'crypto-impl';

/**
 * A 64 byte secret key, the first 32 bytes of which is the
 * private scalar and the last 32 bytes is the public key.
 * Read more: https://blog.mozilla.org/warner/2011/11/29/ed25519-keys/
 */
type Ed25519SecretKey = Uint8Array;

/**
 * Ed25519 Keypair
 */
export interface Ed25519Keypair {
    publicKey: Uint8Array;
    secretKey: Ed25519SecretKey;
}

let shouldInstallSha512 = true;
function installSha512() {
    shouldInstallSha512 = false;
    etc.sha512Sync ||= (...m) => sha512(etc.concatBytes(...m));
}

let shouldInstallCrypto = __NODEJS__;
function installCrypto() {
    shouldInstallCrypto = false;
    if (!globalThis.crypto) {
        globalThis.crypto = cryptoImpl;
    }
}

export const generatePrivateKey = (...args: Parameters<typeof utils.randomPrivateKey>) =>
    utils.randomPrivateKey(...args);
export const generateKeypair = (): Ed25519Keypair => {
    shouldInstallCrypto && installCrypto();
    const privateScalar = utils.randomPrivateKey();
    const publicKey = getPublicKey(privateScalar);
    const secretKey = new Uint8Array(64);
    secretKey.set(privateScalar);
    secretKey.set(publicKey, 32);
    return {
        publicKey,
        secretKey,
    };
};
export const getPublicKey = (...args: Parameters<typeof getPublicKeyImpl>) => {
    shouldInstallSha512 && installSha512();
    return getPublicKeyImpl(...args);
};
export function isOnCurve(publicKey: Uint8Array): boolean {
    try {
        ExtendedPoint.fromHex(publicKey);
        return true;
    } catch {
        return false;
    }
}
export const sign = (message: Parameters<typeof signImpl>[0], secretKey: Ed25519SecretKey) => {
    shouldInstallSha512 && installSha512();
    return signImpl(message, secretKey.slice(0, 32));
};

export const verify = (...args: Parameters<typeof verifyImpl>) => {
    shouldInstallSha512 && installSha512();
    return verifyImpl(...args);
};
