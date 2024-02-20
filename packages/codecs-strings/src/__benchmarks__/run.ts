#!/usr/bin/env -S pnpx tsx

import { webcrypto as crypto } from 'node:crypto';

import { Bench } from 'tinybench';

import { getBase58Codec } from '../base58';

const bench = new Bench({
    throws: true,
});

const bytes32 = new Uint8Array(32);
let base58EncodedString: string;
function randomizeBytes() {
    crypto.getRandomValues(bytes32);
}
const base58Codec = getBase58Codec();

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
    );

(async () => {
    await bench.warmup();
    await bench.run();

    console.table(bench.table());
})();
