#!/usr/bin/env -S pnpm dlx tsx -r ../build-scripts/register-node-globals.cjs

import { webcrypto as crypto } from 'node:crypto';

import { Bench } from 'tinybench';

import { getBase16Codec } from '../base16';
import { getBase58Codec } from '../base58';

const bench = new Bench({
    throws: true,
});

const bytes32 = new Uint8Array(32);
const bytes16 = new Uint8Array(16);
let base58EncodedString: string;
let base16EncodedString: string;
function randomizeBytes() {
    crypto.getRandomValues(bytes32);
    crypto.getRandomValues(bytes16);
}
const base58Codec = getBase58Codec();
const base16Codec = getBase16Codec();

bench
    .add(
        'Base58 decode',
        () => {
            base58Codec.decode(bytes32);
        },
        { beforeEach: randomizeBytes },
    )
    .add(
        'Base58 encode',
        () => {
            base58Codec.encode(base58EncodedString);
        },
        {
            beforeEach() {
                randomizeBytes();
                base58EncodedString = base58Codec.decode(bytes32);
            },
        },
    )
    .add(
        'Base16 encode',
        () => {
            base16Codec.encode(base16EncodedString);
        },
        {
            beforeEach() {
                randomizeBytes();
                base16EncodedString = base16Codec.decode(bytes16);
            },
        },
    );

void (async () => {
    await bench.run();

    console.table(bench.table());
})();
