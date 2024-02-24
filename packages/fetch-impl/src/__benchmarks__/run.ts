#!/usr/bin/env -S pnpx tsx

import { ok } from 'node:assert';
import process from 'node:process';

import { Bench } from 'tinybench';
import { Agent, Dispatcher } from 'undici';

import fetchImpl from '../index.node';

const NUM_CONCURRENT_REQUESTS = 1024;
const URL = process.argv[2];
ok(URL, 'You must supply the URL of a rate-limit-free Solana JSON-RPC server as the first argument to this script');

const bench = new Bench({
    throws: true,
});

let dispatcher: Dispatcher | undefined;
function createDispatcher(options: Agent.Options) {
    dispatcher = new Agent({
        ...options,
        // One second fewer than the Solana RPC's keepalive timeout.
        // Read more: https://github.com/solana-labs/solana/issues/27859#issuecomment-1340097889
        keepAliveTimeout: 19000,
    });
}

let id = 0;
function getTestInit() {
    return {
        body: JSON.stringify({
            id: ++id,
            jsonrpc: '2.0',
            method: 'getLatestBlockhash',
        }),
        headers: {
            'content-type': 'application/json',
        },
        method: 'POST',
    };
}

async function makeConcurrentRequests(num: number = NUM_CONCURRENT_REQUESTS) {
    await Promise.all(
        Array.from({ length: num }).map(() =>
            fetchImpl(URL, {
                dispatcher,
                ...getTestInit(),
            }),
        ),
    );
}

bench
    .add('no dispatcher', () => makeConcurrentRequests(), {
        beforeEach() {
            dispatcher = undefined;
        },
    })
    // FIXME: https://github.com/nodejs/undici/issues/2808
    // .add('unlimited connections http/2', () => makeConcurrentRequests(), {
    //     beforeEach: createDispatcher.bind(null, { allowH2: true, connections: null }),
    // })
    .add('unlimited connections', () => makeConcurrentRequests(), {
        beforeEach: createDispatcher.bind(null, { connections: null }),
    })
    .add('16 connections', () => makeConcurrentRequests(), {
        beforeEach: createDispatcher.bind(null, { connections: 16 }),
    })
    // FIXME: https://github.com/nodejs/undici/issues/2808
    // .add('16 connections, http/2', () => makeConcurrentRequests(), {
    //     beforeEach: createDispatcher.bind(null, { allowH2: true, connections: 16 }),
    // })
    .add('16 connections, pipeline 2 wide', () => makeConcurrentRequests(), {
        beforeEach: createDispatcher.bind(null, { connections: 16, pipelining: 2 }),
    })
    .add('32 connections', () => makeConcurrentRequests(), {
        beforeEach: createDispatcher.bind(null, { connections: 32 }),
    })
    // FIXME: https://github.com/nodejs/undici/issues/2808
    // .add('32 connections, http/2', () => makeConcurrentRequests(), {
    //     beforeEach: createDispatcher.bind(null, { allowH2: true, connections: 32 }),
    // })
    .add('32 connections, pipeline 2 wide', () => makeConcurrentRequests(), {
        beforeEach: createDispatcher.bind(null, { connections: 32, pipelining: 2 }),
    })
    .add('64 connections', () => makeConcurrentRequests(), {
        beforeEach: createDispatcher.bind(null, { connections: 64 }),
    })
    // FIXME: https://github.com/nodejs/undici/issues/2808
    // .add('64 connections, http/2', () => makeConcurrentRequests(), {
    //     beforeEach: createDispatcher.bind(null, { allowH2: true, connections: 64 }),
    // })
    .add('64 connections, pipeline 2 wide', () => makeConcurrentRequests(), {
        beforeEach: createDispatcher.bind(null, { connections: 64, pipelining: 2 }),
    });

(async () => {
    await bench.run();

    console.table(bench.table());
})();
