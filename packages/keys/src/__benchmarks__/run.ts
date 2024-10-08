#!/usr/bin/env -S pnpm dlx tsx -r ../build-scripts/register-node-globals.cjs

import { Bench } from 'tinybench';

import { generateKeyPair, SignatureBytes, signBytes, verifySignature } from '../index';

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

void (async () => {
    await bench.run();
    console.table(bench.table());
})();
