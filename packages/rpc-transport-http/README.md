[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc-transport-http/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc-transport-http/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc-transport-http/v/rc

# @solana/rpc-transport-http

This package allows developers to create custom RPC transports. With this library, one can implement highly specialized functionality for leveraging multiple transports, attempting/handling retries, and more.

## Functions

### `createHttpTransport()`

Call this to create a function that conforms to the `RpcTransport` interface (see `@solana/rpc-spec`). You can use that function in your programs to make `POST` requests with headers suitable for sending JSON data to a server.

```ts
import { createHttpTransport } from '@solana/rpc-transport-http';

const transport = createHttpTransport({ url: 'https://api.mainnet-beta.solana.com' });
const response = await transport({
    payload: { id: 1, jsonrpc: '2.0', method: 'getSlot' },
});
const data = await response.json();
```

#### Config

##### `dispatcher_NODE_ONLY`

In Node environments you can tune how requests are dispatched to the network. Use this config parameter to install a [`undici.Dispatcher`](https://undici.nodejs.org/#/docs/api/Agent) in your transport.

```ts
import { createHttpTransport } from '@solana/rpc-transport-http';
import { Agent, BalancedPool } from 'undici';

// Create a dispatcher that, when called with a special URL, creates a round-robin pool of RPCs.
const dispatcher = new Agent({
    factory(origin, opts) {
        if (origin === 'https://mypool') {
            const upstreams = [
                'https://api.mainnet-beta.solana.com',
                'https://mainnet.helius-rpc.com',
                'https://several-neat-iguana.quiknode.pro',
            ];
            return new BalancedPool(upstreams, {
                ...opts,
                bodyTimeout: 60e3,
                headersTimeout: 5e3,
                keepAliveTimeout: 19e3,
            });
        } else {
            return new Pool(origin, opts);
        }
    },
});
const transport = createHttpTransport({
    dispatcher_NODE_ONLY: dispatcher,
    url: 'https://mypool',
});
let id = 0;
const balances = await Promise.allSettled(
    accounts.map(async account => {
        const response = await transport({
            payload: {
                id: ++id,
                jsonrpc: '2.0',
                method: 'getBalance',
                params: [account],
            },
        });
        return await response.json();
    }),
);
```

##### `fromJson`

An optional function that takes the response as a JSON string and converts it to a JSON value. The request payload is also provided as a second argument. When not provided, the JSON value will be accessed via the `response.json()` method of the fetch API.

##### `headers`

An object of headers to set on the request. Avoid [forbidden headers](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name). Additionally, the headers `Accept`, `Content-Length`, and `Content-Type` are disallowed.

```ts
import { createHttpTransport } from '@solana/rpc-transport-http';

const transport = createHttpTransport({
    headers: {
        // Authorize with the RPC using a bearer token
        Authorization: `Bearer ${process.env.RPC_AUTH_TOKEN}`,
    },
    url: 'https://several-neat-iguana.quiknode.pro',
});
```

##### `toJson`

An optional function that takes the request payload and converts it to a JSON string. When not provided, `JSON.stringify` will be used.

##### `url`

A string representing the target endpoint. In Node, it must be an absolute URL using the `http` or `https` protocol.

### `createHttpTransportForSolanaRpc()`

Creates an `RpcTransport` that uses JSON HTTP requests — much like the `createHttpTransport` function — except that it also uses custom `toJson` and `fromJson` functions in order to allow `bigint` values to be serialized and deserialized correctly over the wire.

Since this is something specific to the Solana RPC API, these custom JSON functions are only triggered when the request is recognized as a Solana RPC request. Normal RPC APIs should aim to wrap their `bigint` values — e.g. `u64` or `i64` — in special value objects that represent the number as a string to avoid numerical values going above `Number.MAX_SAFE_INTEGER`.

It has the same configuration options as `createHttpTransport`, but without the `fromJson` and `toJson` options.

## Augmenting Transports

Using this core transport, you can implement specialized functionality for leveraging multiple transports, attempting/handling retries, and more.

### Round Robin

Here’s an example of how someone might implement a “round robin” approach to distribute requests to multiple transports:

```ts
import { RpcTransport } from '@solana/rpc-spec';
import { RpcResponse } from '@solana/rpc-spec-types';
import { createHttpTransport } from '@solana/rpc-transport-http';

// Create a transport for each RPC server
const transports = [
    createHttpTransport({ url: 'https://mainnet-beta.my-server-1.com' }),
    createHttpTransport({ url: 'https://mainnet-beta.my-server-2.com' }),
    createHttpTransport({ url: 'https://mainnet-beta.my-server-3.com' }),
];

// Create a wrapper transport that distributes requests to them
let nextTransport = 0;
async function roundRobinTransport<TResponse>(...args: Parameters<RpcTransport>): Promise<RpcResponse<TResponse>> {
    const transport = transports[nextTransport];
    nextTransport = (nextTransport + 1) % transports.length;
    return await transport(...args);
}
```

### Sharding

Another example of a possible customization for a transport is to shard requests deterministically among a set of servers. Here’s an example:

Perhaps your application needs to make a large number of requests, or needs to fan request for different methods out to different servers. Here’s an example of an implementation that does the latter:

```ts
import { RpcTransport } from '@solana/rpc-spec';
import { RpcResponse } from '@solana/rpc-spec-types';
import { createHttpTransport } from '@solana/rpc-transport-http';

// Create multiple transports
const transportA = createHttpTransport({ url: 'https://mainnet-beta.my-server-1.com' });
const transportB = createHttpTransport({ url: 'https://mainnet-beta.my-server-2.com' });
const transportC = createHttpTransport({ url: 'https://mainnet-beta.my-server-3.com' });
const transportD = createHttpTransport({ url: 'https://mainnet-beta.my-server-4.com' });

// Function to determine which shard to use based on the request method
function selectShard(method: string): RpcTransport {
    switch (method) {
        case 'getAccountInfo':
        case 'getBalance':
            return transportA;
        case 'getLatestBlockhash':
        case 'getTransaction':
            return transportB;
        case 'sendTransaction':
            return transportC;
        default:
            return transportD;
    }
}

async function shardingTransport<TResponse>(...args: Parameters<RpcTransport>): Promise<RpcResponse<TResponse>> {
    const payload = args[0].payload as { method: string };
    const selectedTransport = selectShard(payload.method);
    return await selectedTransport(...args);
}
```

### Retry Logic

The transport library can also be used to implement custom retry logic on any request:

```ts
import { RpcTransport } from '@solana/rpc-spec';
import { RpcResponse } from '@solana/rpc-spec-types';
import { createHttpTransport } from '@solana/rpc-transport-http';

// Set the maximum number of attempts to retry a request
const MAX_ATTEMPTS = 4;

// Create the default transport
const defaultTransport = createHttpTransport({ url: 'https://mainnet-beta.my-server-1.com' });

// Sleep function to wait for a given number of milliseconds
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Calculate the delay for a given attempt
function calculateRetryDelay(attempt: number): number {
    // Exponential backoff with a maximum of 1.5 seconds
    return Math.min(100 * Math.pow(2, attempt), 1500);
}

// A retrying transport that will retry up to `MAX_ATTEMPTS` times before failing
async function retryingTransport<TResponse>(...args: Parameters<RpcTransport>): Promise<RpcResponse<TResponse>> {
    let requestError;
    for (let attempts = 0; attempts < MAX_ATTEMPTS; attempts++) {
        try {
            return await defaultTransport(...args);
        } catch (err) {
            requestError = err;
            // Only sleep if we have more attempts remaining
            if (attempts < MAX_ATTEMPTS - 1) {
                const retryDelay = calculateRetryDelay(attempts);
                await sleep(retryDelay);
            }
        }
    }
    throw requestError;
}
```

### Failover

Here’s an example of some failover logic integrated into a transport:

```ts
import { RpcTransport } from '@solana/rpc-spec';
import { RpcResponse } from '@solana/rpc-spec-types';
import { createHttpTransport } from '@solana/rpc-transport-http';

// Create a transport for each RPC server
const transports = [
    createHttpTransport({ url: 'https://mainnet-beta.my-server-1.com' }),
    createHttpTransport({ url: 'https://mainnet-beta.my-server-2.com' }),
    createHttpTransport({ url: 'https://mainnet-beta.my-server-2.com' }),
];

// A failover transport that will try each transport in order until one succeeds before failing
async function failoverTransport<TResponse>(...args: Parameters<RpcTransport>): Promise<RpcResponse<TResponse>> {
    let requestError;

    for (const transport of transports) {
        try {
            return await transport(...args);
        } catch (err) {
            requestError = err;
            console.error(err);
        }
    }
    throw requestError;
}
```
