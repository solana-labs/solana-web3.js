#!/usr/bin/env -S pnpx tsx --

import { Bench } from 'tinybench';

import { generateKeyPair, SignatureBytes, signBytes, verifySignature } from '../index';

Object.assign(globalThis, {
    __BROWSER__: false,
    __DEV__: false,
    __NODEJS__: true,
    __REACTNATIVE____: false,
});

const bench = new Bench({
    throws: true,
});

let keyPair: CryptoKeyPair;
async function generateKeyPairForTest() {
    keyPair = await generateKeyPair();
}

let randomBytes: Uint8Array;
function generateRandomBytesForTest() {
    randomBytes ||= new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
}

let signature: SignatureBytes;
async function generateSignatureForBytes() {
    signature = await signBytes(keyPair.privateKey, randomBytes);
}

bench
    .add('generateKeyPair', generateKeyPair)
    .add('signBytes', async () => await signBytes(keyPair.privateKey, randomBytes), {
        async beforeEach() {
            generateRandomBytesForTest();
            await generateKeyPairForTest();
        },
    })
    .add('verifySignature', async () => await verifySignature(keyPair.publicKey, signature, randomBytes), {
        async beforeEach() {
            generateRandomBytesForTest();
            await generateKeyPairForTest();
            await generateSignatureForBytes();
        },
    });

(async () => {
    await bench.run();
    console.table(bench.table());
})();
