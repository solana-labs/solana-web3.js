import crypto from 'node:crypto';

if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = crypto as Crypto;
}
