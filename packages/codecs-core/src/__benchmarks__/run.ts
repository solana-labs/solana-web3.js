#!/usr/bin/env -S pnpm dlx tsx -r ../build-scripts/register-node-globals.cjs

import { webcrypto as crypto } from 'node:crypto';

import { Bench } from 'tinybench';

import { createCodec, FixedSizeCodec } from '../codec';
import { ReadonlyUint8Array } from '../readonly-uint8array';
import { reverseCodec } from '../reverse-codec';

const bench = new Bench({
    throws: true,
});

const noopCodec: FixedSizeCodec<ReadonlyUint8Array, ReadonlyUint8Array> = createCodec({
    fixedSize: 32,
    read(bytes, offset) {
        return [bytes.slice(offset), bytes.length];
    },
    write(value, bytes, offset) {
        bytes.set(value, offset);
        return value.length + offset;
    },
});

const bytes32 = new Uint8Array(32);
function randomizeBytes() {
    crypto.getRandomValues(bytes32);
}

const reverseBytes = reverseCodec(noopCodec);

bench
    .add(
        'Decode reverse',
        () => {
            reverseBytes.decode(bytes32);
        },
        { beforeEach: randomizeBytes },
    )
    .add(
        'Encode reverse',
        () => {
            reverseBytes.encode(bytes32);
        },
        { beforeEach: randomizeBytes },
    );

void (async () => {
    await bench.run();

    console.table(bench.table());
})();
