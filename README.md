[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/web3.js/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/web3.js/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/web3.js/v/rc
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# Solana JavaScript SDK

This is the JavaScript SDK for building Solana apps for Node, web, and React Native.

# Installation

For use in a Node.js or web application:

```shell
npm install --save @solana/web3.js@rc
```

For use in a browser, without a build system:

```html
<!-- Development (debug mode, unminified) -->
<script src="https://unpkg.com/@solana/web3.js@rc/dist/index.development.js"></script>

<!-- Production (minified) -->
<script src="https://unpkg.com/@solana/web3.js@rc/dist/index.production.min.js"></script>
```

# Examples

To get a feel for the API, run and modify the live examples in the `examples/` directory. There, you will find a series of single-purpose Node scripts that demonstrate a specific feature or use case. You will also find a React application that you can run in a browser, that demonstrates being able to create, sign, and send transactions using browser wallets.

# What's New in Version 2.0

Version 2.0 of the Solana JavaScript SDK is a response to many of the pain points you have communicated to us when developing Solana applications with web3.js.

## Tree-Shakability

The object-oriented design of the web3.js (1.x) API prevents optimizing compilers from being able to ‘tree-shake’ unused code from your production builds. No matter how much of the web3.js API you use in your application, you have until now been forced to package all of it.

Read more about tree-shaking here:

-   [Mozilla Developer Docs: Tree Shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)
-   [WebPack Docs: Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
-   [Web.Dev Blog Article: Reduce JavaScript Payloads with Tree Shaking](https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking)

One example of an API that can’t be tree-shaken is the `Connection` class. It has dozens of methods, but because it’s a _class_ you have no choice but to include every method in your application’s final bundle, no matter how many you _actually_ use.

Needlessly large JavaScript bundles can cause issues with deployments to cloud compute providers like Cloudflare or AWS Lambda. They also impact webapp startup performance because of longer download and JavaScript parse times.

Version 2.0 is fully tree-shakable and will remain so, enforced by build-time checks. Optimizing compilers can now eliminate those parts of the library that your application does not use.

The new library itself is comprised of several smaller, modular packages under the `@solana` organization, including:

-   `@solana/accounts`: For fetching and decoding accounts
-   `@solana/codecs`: For composing data (de)serializers from a set of primitives or building custom ones
-   `@solana/errors`: For identifying and refining coded errors thrown in the `@solana` namespace
-   `@solana/rpc`: For sending RPC requests
-   `@solana/rpc-subscriptions`: For subscribing to RPC notifications
-   `@solana/signers`: For building message and/or transaction signer objects
-   `@solana/sysvars`: For fetching and decoding sysvar accounts
-   `@solana/transaction-messages`: For building and transforming Solana transaction message objects
-   `@solana/transactions`: For compiling and signing transactions for submission to the network
-   And many more!

Some of these packages are themselves composed of smaller packages. For instance, `@solana/rpc` is composed of `@solana/rpc-spec` (for core JSON RPC specification types), `@solana/rpc-api` (for the Solana-specific RPC methods), `@solana/rpc-transport-http` (for the default HTTP transport) and so on.

Developers can use the default configurations within the main library (`@solana/web3.js@rc`) or import any of its subpackages where customization-through-composition is desired.

## Composable Internals

Depending on your use case and your tolerance for certain application behaviours, you may wish to configure your application to make a different set of tradeoffs than another developer. The web3.js (1.x) API imposed a rigid set of common-case defaults on _all_ developers, some of which were impossible to change.

The inability to customize web3.js up until now has been a source of frustration:

-   The Mango team wanted to customize the transaction confirmation strategy, but all of that functionality is hidden away behind `confirmTransaction` – a static method of `Connection`. [Here’s the code for `confirmTransaction` on GitHub](https://github.com/solana-labs/solana-web3.js/blob/69a8ad25ef09f9e6d5bff1ffa8428d9be0bd32ac/packages/library-legacy/src/connection.ts#L3734).
-   Solana developer ‘mPaella’ [wanted us to add a feature in the RPC](https://github.com/solana-labs/solana-web3.js/issues/1143#issuecomment-1435927152) that would failover to a set of backup URLs in case the primary one failed.
-   Solana developer ‘epicfaace’ wanted first-class support for automatic time-windowed batching in the RPC transport. [Here’s their pull request](https://github.com/solana-labs/solana/pull/23628).
-   Multiple folks have expressed the need for custom retry logic for failed requests or transactions. [Here’s a pull request from ‘dafyddd’](https://github.com/solana-labs/solana/pull/11811) and [another from ‘abrkn’](https://github.com/solana-labs/solana-web3.js/issues/1041) attempting to modify retry logic to suit their individual use cases.

Version 2.0 exposes far more of its internals, particularly where communication with an RPC is concerned, and allows willing developers the ability to compose new implementations from the default ones that manifest a nearly limitless array of customizations.

The individual modules that make up web3.js are assembled in a **default** configuration reminiscent of the legacy library as part of the npm package `@solana/web3.js@rc`, but those who wish to assemble them in different configurations may do so.

Generic types are offered in numerous places, allowing you to specify new functionality, to make extensions to each API via composition and supertypes, and to encourage you to create higher-level opinionated abstractions of your own.

In fact, we expect you to do so, and to open source some of those for use by others with similar needs.

## Modern JavaScript; Zero-Dependency

The advance of modern JavaScript features presents an opportunity to developers of crypto applications, such as the ability to use native Ed25519 keys and to express large values as native `bigint`.

The Web Incubator Community Group has advocated for the addition of Ed25519 support to the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), and support has already landed in _most_ modern JavaScript runtimes.

Engine support for `bigint` values has also become commonplace. The older `number` primitive in JavaScript has a maximum value of 2^53 - 1, whereas Rust’s `u64` can represent values up to 2^64.

Version 2.0 eliminates userspace implementations of Ed25519 cryptography, large number polyfills, and more, in favour of custom implementations or the use of native JavaScript features, reducing the size of the library. It has no third-party dependencies.

## Functional Architecture

The object oriented, class-based architecture of web3.js (1.x) causes unnecessary bundle bloat. Your application has no choice but to bundle _all_ of the functionality and dependencies of a class no matter how many methods you actually use at runtime.

Class-based architecture also presents unique risks to developers who trigger the dual-package hazard. This describes a situation you can find yourself in if you build for both CommonJS and ES modules. It arises when two copies of the same class are present in the dependency tree, causing checks like `instanceof` to fail. This introduces aggravating and difficult to debug problems.

Read more about dual-package hazard:

-   [NodeJS: Dual Package Hazard](https://nodejs.org/api/packages.html#dual-package-hazard)

Version 2.0 implements no classes (with the notable exception of the `SolanaError` class) and implements the thinnest possible interfaces at function boundaries.

## Statistics

Consider these statistical comparisons between version 2.0 and the legacy 1.x.

|                                                                                                        | 1.x (Legacy) | 2.0        | +/- % |
| ------------------------------------------------------------------------------------------------------ | ------------ | ---------- | ----- |
| Total minified size of library                                                                         | 81 KB        | 57.5 KB    | -29%  |
| Total minified size of library (when runtime supports Ed25519)                                         | 81 KB        | 53 KB      | -33%  |
| Bundled size of a web application that executes a transfer of lamports                                 | 111 KB       | 23.9 KB    | -78%  |
| Bundled size of a web application that executes a transfer of lamports (when runtime supports Ed25519) | 111 KB       | 18.2 KB    | -83%  |
| Performance of key generation, signing, and verifying signatures (Brave with Experimental API flag)    | 700 ops/s    | 7000 ops/s | +900% |
| First-load size for Solana Explorer                                                                    | 311 KB       | 228 KB     | -26%  |

The re-engineered library achieves these speedups and reductions in bundle size in large part through use of modern JavaScript APIs.

To validate our work, we replaced the legacy 1.x library with the new 2.0 library on the homepage of the Solana Explorer. Total first-load bundle size dropped by 26% without removing a single feature. [Here’s an X thread](https://twitter.com/callum_codes/status/1679124485218226176) by Callum McIntyre if you would like to dig deeper.

# A Tour of the Version 2.0 API

Here’s an overview of how to use the new library to interact with the RPC, configure network transports, work with Ed25519 keys, and to serialize data.

## RPC

Version 2.0 ships with an implementation of the [JSON RPC specification](https://www.jsonrpc.org/specification) and a type spec for the [Solana JSON RPC](https://docs.solana.com/api).

The main package responsible for managing communication with an RPC is `@solana/rpc`. However, this package makes use of more granular packages to break down the RPC logic into smaller pieces. Namely, these packages are:

-   `@solana/rpc`: Contains all logic related to sending Solana RPC calls.
-   `@solana/rpc-api`: Describes all Solana RPC methods using types.
-   `@solana/rpc-transport-http`: Provides a concrete implementation of an RPC transport using HTTP requests.
-   `@solana/rpc-spec`: Defines the JSON RPC spec for sending RPC requests.
-   `@solana/rpc-spec-types`: Shared JSON RPC specifications types and helpers that are used by both `@solana/rpc` and `@solana/rpc-subscriptions` (described in the next section).
-   `@solana/rpc-types`: Shared Solana RPC types and helpers that are used by both `@solana/rpc` and `@solana/rpc-subscriptions`.

The main `@solana/web3.js` package re-exports the `@solana/rpc` package so, going forward, we will import RPC types and functions from the library directly.

### RPC Calls

You can use the `createSolanaRpc` function by providing the URL of a Solana JSON RPC server. This will create a default client for interacting with the Solana JSON RPC API.

```ts
import { createSolanaRpc } from '@solana/web3.js';

// Create an RPC client.
const rpc = createSolanaRpc('http://127.0.0.1:8899');
//    ^? Rpc<SolanaRpcApi>

// Send a request.
const slot = await rpc.getSlot().send();
```

### Custom RPC Transports

The `createSolanaRpc` function communicates with the RPC server using a default HTTP transport that should satisfy most use cases. You can provide your own transport or wrap an existing one to communicate with RPC servers in any way you see fit. In the example below, we explicitly create a transport and use it to create a new RPC client via the `createSolanaRpcFromTransport` function.

```ts
import { createSolanaRpcFromTransport, createDefaultRpcTransport } from '@solana/web3.js';

// Create an HTTP transport or any custom transport of your choice.
const transport = createDefaultRpcTransport({ url: 'https://api.devnet.solana.com' });

// Create an RPC client using that transport.
const rpc = createSolanaRpcFromTransport(transport);
//    ^? Rpc<SolanaRpcApi>

// Send a request.
const slot = await rpc.getSlot().send();
```

A custom transport can implement specialized functionality such as coordinating multiple transports, implementing retries, and more. Let's take a look at some concrete examples.

#### Round Robin

A ‘round robin’ transport is one that distributes requests to a list of endpoints in sequence.

```ts
import { createDefaultRpcTransport, createSolanaRpcFromTransport, type RpcTransport } from '@solana/web3.js';

// Create an HTTP transport for each RPC server.
const transports = [
    createDefaultRpcTransport({ url: 'https://mainnet-beta.my-server-1.com' }),
    createDefaultRpcTransport({ url: 'https://mainnet-beta.my-server-2.com' }),
    createDefaultRpcTransport({ url: 'https://mainnet-beta.my-server-3.com' }),
];

// Set up the round-robin transport.
let nextTransport = 0;
async function roundRobinTransport<TResponse>(...args: Parameters<RpcTransport>): Promise<TResponse> {
    const transport = transports[nextTransport];
    nextTransport = (nextTransport + 1) % transports.length;
    return await transport(...args);
}

// Create an RPC client using the round-robin transport.
const rpc = createSolanaRpcFromTransport(roundRobinTransport);
```

#### Sharding

A sharding transport is a kind of distributing transport that sends requests to a particular server based on something about the request itself. Here’s an example that sends requests to different servers depending on the name of the method:

```ts
import { createDefaultRpcTransport, createSolanaRpcFromTransport, type RpcTransport } from '@solana/web3.js';

// Create multiple transports.
const transportA = createDefaultRpcTransport({ url: 'https://mainnet-beta.my-server-1.com' });
const transportB = createDefaultRpcTransport({ url: 'https://mainnet-beta.my-server-2.com' });
const transportC = createDefaultRpcTransport({ url: 'https://mainnet-beta.my-server-3.com' });
const transportD = createDefaultRpcTransport({ url: 'https://mainnet-beta.my-server-4.com' });

// Function to determine which shard to use based on the request method.
function selectShard(method: string): RpcTransport {
    switch (method) {
        case 'getAccountInfo':
        case 'getBalance':
            return transportA;
        case 'getTransaction':
        case 'getRecentBlockhash':
            return transportB;
        case 'sendTransaction':
            return transportC;
        default:
            return transportD;
    }
}

// Create a transport that selects the correct transport given the request method name.
async function shardingTransport<TResponse>(...args: Parameters<RpcTransport>): Promise<TResponse> {
    const payload = args[0].payload as { method: string };
    const selectedTransport = selectShard(payload.method);
    return (await selectedTransport(...args)) as TResponse;
}

// Create an RPC client using the sharding transport.
const rpc = createSolanaRpcFromTransport(shardingTransport);
```

#### Retry

A custom transport is a good place to implement global retry logic for every request:

```ts
import { createDefaultRpcTransport, createSolanaRpcFromTransport, type RpcTransport } from '@solana/web3.js';

// Set the maximum number of attempts to retry a request.
const MAX_ATTEMPTS = 4;

// Create the default transport.
const defaultTransport = createDefaultRpcTransport({ url: 'https://mainnet-beta.my-server-1.com' });

// Sleep function to wait for a given number of milliseconds.
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Calculate the delay for a given attempt.
function calculateRetryDelay(attempt: number): number {
    // Exponential backoff with a maximum of 1.5 seconds.
    return Math.min(100 * Math.pow(2, attempt), 1500);
}

// A retrying transport that will retry up to MAX_ATTEMPTS times before failing.
async function retryingTransport<TResponse>(...args: Parameters<RpcTransport>): Promise<TResponse> {
    let requestError;
    for (let attempts = 0; attempts < MAX_ATTEMPTS; attempts++) {
        try {
            return await defaultTransport(...args);
        } catch (err) {
            requestError = err;
            // Only sleep if we have more attempts remaining.
            if (attempts < MAX_ATTEMPTS - 1) {
                const retryDelay = calculateRetryDelay(attempts);
                await sleep(retryDelay);
            }
        }
    }
    throw requestError;
}

// Create the RPC client using the retrying transport.
const rpc = createSolanaRpcFromTransport(retryingTransport);
```

#### Failover

Support for handling network failures can be implemented in the transport itself. Here’s an example of some failover logic integrated into a transport:

```ts
// TODO: Your turn; send us a pull request with an example.
```

### Augmenting/Constraining the RPC API

Using the `createSolanaRpc` or `createSolanaRpcFromTransport` methods, we always get the same API that includes the Solana RPC API methods. Since the RPC API is described using types only, it is possible to augment those types to add your own methods.

When constraining the API scope, keep in mind that types don’t affect bundle size. You may still like to constrain the type-spec for a variety of reasons, including reducing TypeScript noise.

#### Constraining by Cluster

If you're using a specific cluster, you may wrap your RPC URL inside a helper function like `mainnet` or `devnet` to inject that information into the RPC type system.

```ts
import { createSolanaRpc, mainnet, devnet } from '@solana/web3.js';

const mainnetRpc = createSolanaRpc(mainnet('https://api.mainnet-beta.solana.com'));
//    ^? RpcMainnet<SolanaRpcApiMainnet>

const devnetRpc = createSolanaRpc(devnet('https://api.devnet.solana.com'));
//    ^? RpcDevnet<SolanaRpcApiDevnet>
```

In the example above, `devnetRpc.requestAirdrop(..)` will work, but `mainnetRpc.requestAirdrop(..)` will raise a TypeScript error since `requestAirdrop` is not a valid method of the mainnet cluster.

#### Cherry-Picking API Methods

You can constrain the API’s type-spec even further so you are left only with the methods you need. The simplest way to do this is to cast the created RPC client to a type that only includes the required methods.

```ts
import { createSolanaRpc, type Rpc, type GetAccountInfoApi, type GetMultipleAccountsApi } from '@solana/web3.js';

const rpc = createSolanaRpc('http://127.0.0.1:8899') as Rpc<GetAccountInfoApi & GetMultipleAccountsApi>;
```

Alternatively, you can explicitly create the RPC API using the `createSolanaRpcApi` function. You will need to create your own transport and bind the two together using the `createRpc` function.

```ts
import {
    createDefaultRpcTransport,
    createRpc,
    createSolanaRpcApi,
    DEFAULT_RPC_CONFIG,
    type GetAccountInfoApi,
    type GetMultipleAccountsApi,
} from '@solana/web3.js';

const api = createSolanaRpcApi<GetAccountInfoApi & GetMultipleAccountsApi>(DEFAULT_RPC_CONFIG);
const transport = createDefaultRpcTransport({ url: 'http:127.0.0.1:8899' });

const rpc = createRpc({ api, transport });
```

Note that the `createSolanaRpcApi` function is a wrapper on top of the `createJsonRpcApi` function which adds some Solana-specific transformers such as setting a default commitment on all methods or throwing an error when an integer overflow is detected.

#### Creating Your Own API Methods

The new library’s RPC specification supports an _infinite_ number of JSON-RPC methods with **zero increase** in bundle size.

This means the library can support future additions to the official [Solana JSON RPC](https://docs.solana.com/api), or [custom RPC methods](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api/get-asset) defined by some RPC provider.

Here’s an example of how a developer at might build a custom RPC type-spec for an RPC provider's implementation of the Metaplex Digital Asset Standard's `getAsset` method:

```ts
import { RpcApiMethods } from '@solana/web3.js';

// Define the method's response payload.
type GetAssetApiResponse = Readonly<{
    interface: DasApiAssetInterface;
    id: Address;
    content: Readonly<{
        files?: readonly {
            mime?: string;
            uri?: string;
            [key: string]: unknown;
        }[];
        json_uri: string;
        links?: readonly {
            [key: string]: unknown;
        }[];
        metadata: DasApiMetadata;
    }>;
    /* ...etc... */
}>;

// Set up a type spec for the request method.
type GetAssetApi = {
    // Define the method's name, parameters and response type
    getAsset(args: { id: Address }): GetAssetApiResponse;
};

// Export the type spec for downstream users.
export type MetaplexDASApi = GetAssetApi;
```

Here’s how a developer might use it:

```ts
import { createDefaultRpcTransport, createRpc, createJsonRpcApi } from '@solana/web3.js';

// Create the custom API.
const api = createJsonRpcApi<MetaplexDASApi>();

// Set up an HTTP transport to a server that supports the custom API.
const transport = createDefaultRpcTransport({
    url: 'https://mainnet.helius-rpc.com/?api-key=<api_key>',
});

// Create the RPC client.
const metaplexDASRpc = createRpc({ api, transport });
//    ^? Rpc<MetaplexDASApi>
```

As long as a particular JSON RPC method adheres to the [official JSON RPC specification](https://www.jsonrpc.org/specification), it will be supported by version 2.0.

### Aborting RPC Requests

RPC requests are now abortable with modern `AbortControllers`. When calling an RPC method such as `getSlot`, it will return a `PendingRpcRequest` proxy object that contains a `send` method to send the request to the server.

```ts
const pendingRequest: PendingRpcRequest<Slot> = rpc.getSlot();

const slot: Slot = await pendingRequest.send();
```

The arguments of the `getSlot` method are reserved for the request payload, but the `send` method is where additional arguments such as an `AbortSignal` can be accepted in the context of the request.

Aborting RPC requests can be useful for a variety of things such as setting a timeout on a request or cancelling a request when a user navigates away from a page.

```ts
import { createSolanaRpc } from '@solana/web3.js';

const rpc = createSolanaRpc('http://127.0.0.1:8900');

// Create a new AbortController.
const abortController = new AbortController();

// Abort the request when the user navigates away from the current page.
function onUserNavigateAway() {
    abortController.abort();
}

// The request will be aborted if and only if the user navigates away from the page.
const slot = await rpc.getSlot().send({ abortSignal: abortController.signal });
```

Read more about `AbortController` here:

-   [Mozilla Developer Docs: `AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
-   [Mozilla Developer Docs: `AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
-   [JavaScript.info: Fetch: Abort](https://javascript.info/fetch-abort)

## RPC Subscriptions

Subscriptions in the legacy library do not allow custom retry logic and do not allow you to recover from potentially missed messages. The new version does away with silent retries, surfaces transport errors to your application, and gives you the opportunity to recover from gap events.

The main package responsible for managing communication with RPC subscriptions is `@solana/rpc-subscriptions`. However, similarly to `@solana/rpc`, this package also makes use of more granular packages. These packages are:

-   `@solana/rpc-subscriptions`: Contains all logic related to subscribing to Solana RPC notifications.
-   `@solana/rpc-subscriptions-api`: Describes all Solana RPC subscriptions using types.
-   `@solana/rpc-subscriptions-channel-websocket`: Provides a concrete implementation of an RPC Subscriptions channel using WebSockets.
-   `@solana/rpc-subscriptions-spec`: Defines the JSON RPC spec for subscribing to RPC notifications.
-   `@solana/rpc-spec-types`: Shared JSON RPC specifications types and helpers that are used by both `@solana/rpc` and `@solana/rpc-subscriptions`.
-   `@solana/rpc-types`: Shared Solana RPC types and helpers that are used by both `@solana/rpc` and `@solana/rpc-subscriptions`.

Since the main `@solana/web3.js` library also re-exports the `@solana/rpc-subscriptions` package we will import RPC Subscriptions types and functions directly from the main library going forward.

### Getting Started with RPC Subscriptions

To get started with RPC Subscriptions, you may use the `createSolanaRpcSubscriptions` function by providing the WebSocket URL of a Solana JSON RPC server. This will create a default client for interacting with Solana RPC Subscriptions.

```ts
import { createSolanaRpcSubscriptions } from '@solana/web3.js';

// Create an RPC Subscriptions client.
const rpcSubscriptions = createSolanaRpcSubscriptions('ws://127.0.0.1:8900');
//    ^? RpcSubscriptions<SolanaRpcSubscriptionsApi>
```

### Subscriptions as `AsyncIterators`

The new subscriptions API vends subscription notifications as an `AsyncIterator`. The `AsyncIterator` conforms to the [async iterator protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols), which allows developers to consume messages using a `for await...of` loop.

Here’s an example of working with a subscription in the new library:

```ts
import { address, createSolanaRpcSubscriptions, createDefaultRpcSubscriptionsTransport } from '@solana/web3.js';

// Create the RPC Subscriptions client.
const rpcSubscriptions = createSolanaRpcSubscriptions('ws://127.0.0.1:8900');

// Set up an abort controller.
const abortController = new AbortController();

// Subscribe to account notifications.
const accountNotifications = await rpcSubscriptions
    .accountNotifications(address('AxZfZWeqztBCL37Mkjkd4b8Hf6J13WCcfozrBY6vZzv3'), { commitment: 'confirmed' })
    .subscribe({ abortSignal: abortController.signal });

try {
    // Consume messages.
    for await (const notification of accountNotifications) {
        console.log('New balance', notification.value.lamports);
    }
} catch (e) {
    // The subscription went down.
    // Retry it and then recover from potentially having missed
    // a balance update, here (eg. by making a `getBalance()` call).
}
```

You can read more about `AsyncIterator` at the following links:

-   [Mozilla Developer Docs: `AsyncIterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator)
-   [Luciano Mammino (Blog): JavaScript Async Iterators](https://www.nodejsdesignpatterns.com/blog/javascript-async-iterators/)

### Aborting RPC Subscriptions

Similarly to RPC calls, applications can terminate active subscriptions using an `AbortController` attribute on the `subscribe` method. In fact, this parameter is _required_ for subscriptions to encourage you to clean up subscriptions that your application no longer needs.

Let's take a look at some concrete examples that demonstrate how to abort subscriptions.

#### Subscription Timeout

Here's an example of an `AbortController` used to abort a subscription after a 5-second timeout:

```ts
import { createSolanaRpcSubscriptions } from '@solana/web3.js';

const rpcSubscriptions = createSolanaRpcSubscriptions('ws://127.0.0.1:8900');

// Subscribe for slot notifications using an AbortSignal that times out after 5 seconds.
const slotNotifications = await rpcSubscriptions
    .slotNotifications()
    .subscribe({ abortSignal: AbortSignal.timeout(5000) });

// Log slot notifications.
for await (const notification of slotNotifications) {
    console.log('Slot notification', notification);
}

console.log('Done.');
```

Read more about `AbortController` at the following links:

-   [Mozilla Developer Docs: `AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
-   [Mozilla Developer Docs: `AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
-   [JavaScript.info: Fetch: Abort](https://javascript.info/fetch-abort)

#### Cancelling Subscriptions

It is also possible to abort a subscription inside the `for await...of` loop. This enables us to cancel a subscription based on some condition, such as a change in the state of an account. For instance, the following example cancels a subscription when the owner of an account changes:

```ts
// Subscribe to account notifications.
const accountNotifications = await rpc
    .accountNotifications(address('AxZfZWeqztBCL37Mkjkd4b8Hf6J13WCcfozrBY6vZzv3'), { commitment: 'confirmed' })
    .subscribe({ abortSignal });

// Consume messages.
let previousOwner = null;
for await (const notification of accountNotifications) {
    const {
        value: { owner },
    } = notification;
    // Check the owner to see if it has changed
    if (previousOwner && owner !== previousOwner) {
        // If so, abort the subscription
        abortController.abort();
    } else {
        console.log(notification);
    }
    previousOwner = owner;
}
```

### Failed vs. Aborted Subscriptions

It is important to note that a subscription failure behaves differently from a subscription abort. A subscription failure occurs when the subscription goes down and will throw an error that can be intercepted in a `try/catch`. However, an aborted subscription will not throw an error, but will instead exit the `for await...of` loop.

```ts
try {
    for await (const notification of notifications) {
        // Consume messages.
    }
    // [ABORTED] Reaching this line means the subscription was aborted — i.e. unsubscribed.
} catch (e) {
    // [FAILED] Reaching this line means the subscription went down.
    // Retry it, then recover from potential missed messages.
} finally {
    // [ABORTED or FAILED] Whether the subscription failed or was aborted, you can run cleanup code here.
}
```

### Message Gap Recovery

One of the most crucial aspects of any subscription API is managing potential missed messages. Missing messages, such as account state updates, could be catastrophic for an application. That’s why the new library provides native support for recovering missed messages using the `AsyncIterator`.

When a connection fails unexpectedly, any messages you miss while disconnected can result in your UI falling behind or becoming corrupt. Because subscription failure is now made explicit in the new API, you can implement ‘catch-up’ logic after re-establishing the subscription.

Here’s an example of such logic:

```ts
try {
    for await (const notif of accountNotifications) {
        updateAccountBalance(notif.lamports);
    }
} catch (e) {
    // The subscription failed.
    // First, re-establish the subscription.
    await setupAccountBalanceSubscription(address);
    // Then make a one-shot request to 'catch up' on any missed balance changes.
    const { value: lamports } = await rpc.getBalance(address).send();
    updateAccountBalance(lamports);
}
```

### Using Custom RPC Subscriptions Transports

The `createSolanaRpcSubscriptions` function communicates with the RPC server using a default `WebSocket` channel that should satisfy most use cases. However, you may here as well provide your own channel creator or decorate existing ones to communicate with RPC servers in any way you see fit. In the example below, we supply a custom `WebSocket` channel creator and use it to create a new RPC Subscriptions client via the `createSolanaRpcSubscriptionsFromTransport` function.

```ts
import { createDefaultRpcSubscriptionsTransport, createSolanaRpcSubscriptionsFromTransport } from '@solana/web3.js';

// Create a transport with a custom channel creator of your choice.
const transport = createDefaultRpcSubscriptionsTransport({
    createChannel({ abortSignal }) {
        return createWebSocketChannel({
            maxSubscriptionsPerChannel: 100,
            minChannels: 25,
            sendBufferHighWatermark: 32_768,
            signal: abortSignal,
            url: 'ws://127.0.0.1:8900',
        });
    },
});

// Create an RPC client using that transport.
const rpcSubscriptions = createSolanaRpcSubscriptionsFromTransport(transport);
//    ^? RpcSubscriptions<SolanaRpcSubscriptionsApi>
```

### Augmenting/Constraining the RPC Subscriptions API

Using the `createSolanaRpcSubscriptions` or `createSolanaRpcSubscriptionsFromTransport` functions, we always get the same RPC Subscriptions API, including all Solana RPC stable subscriptions. However, since the RPC Subscriptions API is described using types only, it is possible to constrain the API to a specific set of subscriptions or even add your own custom subscriptions.

#### Constraining by Cluster

If you're using a specific cluster, you may wrap your RPC URL inside a helper function like `mainnet` or `devnet` to inject that information into the RPC type system.

```ts
import { createSolanaRpcSubscriptions, mainnet, devnet } from '@solana/web3.js';

const mainnetRpc = createSolanaRpcSubscriptions(mainnet('https://api.mainnet-beta.solana.com'));
//    ^? RpcSubscriptionsMainnet<SolanaRpcSubscriptionsApi>

const devnetRpc = createSolanaRpcSubscriptions(devnet('https://api.devnet.solana.com'));
//    ^? RpcSubscriptionsDevnet<SolanaRpcSubscriptionsApi>
```

#### Including Unstable Subscriptions

If your app needs access to [unstable RPC Subscriptions](https://docs.solana.com/api/websocket#blocksubscribe) — e.g. `BlockNotificationsApi` or `SlotsUpdatesNotificationsApi` — and your RPC server supports them, you may use the `createSolanaRpcSubscriptions_UNSTABLE` and `createSolanaRpcSubscriptionsFromTransport_UNSTABLE` functions to create an RPC Subscriptions client that includes those subscriptions.

```ts
import {
    createDefaultRpcSubscriptionsChannelCreator,
    createDefaultRpcSubscriptionsTransport,
    createSolanaRpcSubscriptions_UNSTABLE,
    createSolanaRpcSubscriptionsFromTransport_UNSTABLE,
} from '@solana/web3.js';

// Using the default WebSocket channel.
const rpcSubscriptions = createSolanaRpcSubscriptions_UNSTABLE('ws://127.0.0.1:8900');
//    ^? RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>

// Using a custom transport.
const transport = createDefaultRpcSubscriptionsTransport({
    createChannel: createDefaultRpcSubscriptionsChannelCreator({
        url: 'ws://127.0.0.1:8900',
    }),
});
const rpcSubscriptions = createSolanaRpcSubscriptionsFromTransport_UNSTABLE(transport);
//    ^? RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>
```

#### Cherry-Picking API Methods

You may constrain the scope of the Subscription API even further so you are left only with the subscriptions you need. The simplest way to do this is to cast the created RPC client to a type that only includes the methods you need.

```ts
import {
    createSolanaRpcSubscriptions,
    type RpcSubscriptions,
    type AccountNotificationsApi,
    type SlotNotificationsApi,
} from '@solana/web3.js';

const rpc = createSolanaRpcSubscriptions('ws://127.0.0.1:8900') as RpcSubscriptions<
    AccountNotificationsApi & SlotNotificationsApi
>;
```

Alternatively, you may explicitly create the RPC Subscriptions API using the `createSolanaRpcSubscriptionsApi` function. You will then need to create your own transport explicitly and bind the two together using the `createSubscriptionRpc` function.

```ts
import {
    createDefaultRpcSubscriptionsChannelCreator,
    createDefaultRpcSubscriptionsTransport,
    createSubscriptionRpc,
    createSolanaRpcSubscriptionsApi,
    DEFAULT_RPC_CONFIG,
    type AccountNotificationsApi,
    type SlotNotificationsApi,
} from '@solana/web3.js';

const api = createSolanaRpcSubscriptionsApi<AccountNotificationsApi & SlotNotificationsApi>(DEFAULT_RPC_CONFIG);
const transport = createDefaultRpcSubscriptionsTransport({
    createChannel: createDefaultRpcSubscriptionsChannelCreator({
        url: 'ws://127.0.0.1:8900',
    }),
});
const rpcSubscriptions = createSubscriptionRpc({ api, transport });
```

Note that the `createSolanaRpcSubscriptionsApi` function is a wrapper on top of the `createRpcSubscriptionsApi` function which adds some Solana-specific transformers such as setting a default commitment on all methods or throwing an error when an integer overflow is detected.

## Keys

The new library takes a brand-new approach to Solana key pairs and addresses, which will feel quite different from the classes `PublicKey` and `Keypair` from version 1.x.

### Web Crypto API

All key operations now use the native Ed25519 implementation in JavaScript’s Web Crypto API.

The API itself is designed to be a more reliably secure way to manage highly sensitive secret key information, but **developers should still use extreme caution when dealing with secret key bytes in their applications**.

One thing to note is that many operations from Web Crypto – such as importing, generating, signing, and verifying are now **asynchronous**.

Here’s an example of generating a `CryptoKeyPair` using the Web Crypto API and signing a message:

```ts
import { generateKeyPair, signBytes, verifySignature } from '@solana/web3.js';

const keyPair: CryptoKeyPair = await generateKeyPair();

const message = new Uint8Array(8).fill(0);

const signedMessage = await signBytes(keyPair.privateKey, message);
//    ^? Signature

const verified = await verifySignature(keyPair.publicKey, signedMessage, message);
```

### Web Crypto Polyfill

Wherever Ed25519 is not supported, we offer a polyfill for Web Crypto’s Ed25519 API.

This polyfill can be found at `@solana/webcrypto-ed25519-polyfill` and mimics the functionality of the Web Crypto API for Ed25519 key pairs using the same userspace implementation we used in web3.js 1.x. It does not polyfill other algorithms.

Determine if your target runtime supports Ed25519, and install the polyfill if it does not:

```ts
import { install } from '@solana/webcrypto-ed25519-polyfill';
import { generateKeyPair, signBytes, verifySignature } from '@solana/web3.js';

install();
const keyPair: CryptoKeyPair = await generateKeyPair();

/* Remaining logic */
```

You can see where Ed25519 is currently supported in [this GitHub issue](https://github.com/WICG/webcrypto-secure-curves/issues/20) on the Web Crypto repository. Consider sniffing the user-agent when deciding whether or not to deliver the polyfill to browsers.

Operations on `CryptoKey` objects using the Web Crypto API _or_ the polyfill are mostly handled by the `@solana/keys` package.

### String Addresses

All addresses are now JavaScript strings. They are represented by the opaque type `Address`, which describes exactly what a Solana address actually is.

Consequently, that means no more `PublicKey`.

Here’s what they look like in development:

```ts
import { Address, address, getAddressFromPublicKey, generateKeyPair } from '@solana/web3.js';

// Coerce a string to an `Address`
const myOtherAddress = address('AxZfZWeqztBCL37Mkjkd4b8Hf6J13WCcfozrBY6vZzv3');

// Typecast it instead
const myAddress =
    'AxZfZWeqztBCL37Mkjkd4b8Hf6J13WCcfozrBY6vZzv3' as Address<'AxZfZWeqztBCL37Mkjkd4b8Hf6J13WCcfozrBY6vZzv3'>;

// From CryptoKey
const keyPair = await generateKeyPair();
const myPublicKeyAsAddress = await getAddressFromPublicKey(keyPair.publicKey);
```

Some tooling for working with base58-encoded addresses can be found in the `@solana/addresses` package.

## Transactions

### Creating Transaction Messages

Like many other familiar aspects of the 1.0 library, transactions have received a makeover.

For starters, all transaction messages are now version-aware, so there’s no longer a need to juggle two different types (eg. `Transaction` vs. `VersionedTransaction`).

Address lookups are now completely described inside transaction message instructions, so you don’t have to materialize `addressTableLookups` anymore.

Here’s a simple example of creating a transaction message &ndash; notice how its type is refined at each step of the process:

```ts
import {
    address,
    createTransactionMessage,
    setTransactionMessageFeePayer,
    setTransactionMessageLifetimeUsingBlockhash,
    Blockhash,
} from '@solana/web3.js';

const recentBlockhash = {
    blockhash: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY' as Blockhash,
    lastValidBlockHeight: 196055492n,
};
const feePayer = address('AxZfZWeqztBCL37Mkjkd4b8Hf6J13WCcfozrBY6vZzv3');

// Create a new transaction message
const transactionMessage = createTransactionMessage({ version: 0 });
//    ^? V0TransactionMessage

// Set the fee payer
const transactionMessageWithFeePayer = setTransactionMessageFeePayer(feePayer, transactionMessage);
//    ^? V0TransactionMessage & ITransactionMessageWithFeePayer

const transactionMessageWithFeePayerAndLifetime = setTransactionMessageLifetimeUsingBlockhash(
    // ^? V0TransactionMessage & ITransactionMessageWithFeePayer & TransactionMessageWithBlockhashLifetime
    recentBlockhash,
    transactionMessageWithFeePayer,
);
```

As you can see, each time a transaction message is modified, the type reflects its new shape. If you add a fee payer, you’ll get a type representing a transaction message with a fee payer, and so on.

Transaction message objects are also **frozen by these functions** to prevent them from being mutated in place.

### Signing Transaction Messages

The `signTransaction(..)` function will raise a type error if your transaction message is not already equipped with a fee payer and a lifetime. This helps you catch errors at author-time instead of runtime.

```ts
const feePayer = address('AxZfZWeqztBCL37Mkjkd4b8Hf6J13WCcfozrBY6vZzv3');
const signer = await generateKeyPair();

const transactionMessage = createTransactionMessage({ version: 'legacy' });
const transactionMessageWithFeePayer = setTransactionMessageFeePayer(feePayer, transactionMessage);

// Attempting to sign the transaction message without a lifetime will throw a type error
const signedTransaction = await signTransaction([signer], transactionMessageWithFeePayer);
// => "Property 'lifetimeConstraint' is missing in type"
```

### Calibrating a Transaction Message's Compute Unit Budget

Correctly budgeting a compute unit limit for your transaction message can increase the probability that your transaction will be accepted for processing. If you don't declare a compute unit limit on your transaction, validators will assume an upper limit of 200K compute units (CU) per instruction.

Since validators have an incentive to pack as many transactions into each block as possible, they may choose to include transactions that they know will fit into the remaining compute budget for the current block over transactions that might not. For this reason, you should set a compute unit limit on each of your transaction messages, whenever possible.

Use this utility to estimate the actual compute unit cost of a given transaction message.

```ts
import { getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';
import { createSolanaRpc, getComputeUnitEstimateForTransactionMessageFactory, pipe } from '@solana/web3.js';

// Create an estimator function.
const rpc = createSolanaRpc('http://127.0.0.1:8899');
const getComputeUnitEstimateForTransactionMessage = getComputeUnitEstimateForTransactionMessageFactory({
    rpc,
});

// Create your transaction message.
const transactionMessage = pipe(
    createTransactionMessage({ version: 'legacy' }),
    /* ... */
);

// Request an estimate of the actual compute units this message will consume.
const computeUnitsEstimate = await getComputeUnitEstimateForTransactionMessage(transactionMessage);

// Set the transaction message's compute unit budget.
const transactionMessageWithComputeUnitLimit = prependTransactionMessageInstruction(
    getSetComputeUnitLimitInstruction({ units: computeUnitsEstimate }),
    transactionMessage,
);
```

> [!WARNING]
> The compute unit estimate is just that &ndash; an estimate. The compute unit consumption of the actual transaction might be higher or lower than what was observed in simulation. Unless you are confident that your particular transaction message will consume the same or fewer compute units as was estimated, you might like to augment the estimate by either a fixed number of CUs or a multiplier.

> [!NOTE]
> If you are preparing an _unsigned_ transaction, destined to be signed and submitted to the network by a wallet, you might like to leave it up to the wallet to determine the compute unit limit. Consider that the wallet might have a more global view of how many compute units certain types of transactions consume, and might be able to make better estimates of an appropriate compute unit budget.

### Helpers For Building Transaction Messages

Building transaction messages in this manner might feel different from what you’re used to. Also, we certainly wouldn’t want you to have to bind transformed transaction messages to a new variable at each step, so we have released a functional programming library dubbed `@solana/functional` that lets you build transaction messages in **pipelines**. Here’s how it can be used:

```ts
import { pipe } from '@solana/functional';
import {
    address,
    createTransactionMessage,
    setTransactionMessageFeePayer,
    setTransactionMessageLifetimeUsingBlockhash,
    Blockhash,
} from '@solana/web3.js';

// Use `pipe(..)` to create a pipeline of transaction message transformation operations
const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayer(feePayer, tx),
    tx => setTransactionMessageLifetimeUsingBlockhash(recentBlockhash, tx),
);
```

Note that `pipe(..)` is general-purpose, so it can be used to pipeline any functional transforms.

## Codecs

We have taken steps to make it easier to write data (de)serializers, especially as they pertain to Rust datatypes and byte buffers.

Solana’s codecs libraries are broken up into modular components so you only need to import the ones you need. They are:

-   `@solana/codecs-core`: The core codecs library for working with codecs serializers and creating custom ones
-   `@solana/codecs-numbers`: Used for serialization of numbers (little-endian and big-endian bytes, etc.)
-   `@solana/codecs-strings`: Used for serialization of strings
-   `@solana/codecs-data-structures`: Codecs and serializers for structs
-   `@solana/options`: Designed to build codecs and serializers for types that mimic Rust’s enums, which can include embedded data within their variants such as values, tuples, and structs

These packages are included in the main `@solana/web3.js` library but you may also import them from `@solana/codecs` if you only need the codecs.

Here’s an example of encoding and decoding a custom struct with some strings and numbers:

```ts
import { addCodecSizePrefix } from '@solana/codecs-core';
import { getStructCodec } from '@solana/codecs-data-structures';
import { getU32Codec, getU64Codec, getU8Codec } from '@solana/codecs-numbers';
import { getUtf8Codec } from '@solana/codecs-strings';

// Equivalent in Rust:
// struct {
//     amount: u64,
//     decimals: u8,
//     name: String,
// }
const structCodec = getStructCodec([
    ['amount', getU64Codec()],
    ['decimals', getU8Codec()],
    ['name', addCodecSizePrefix(getUtf8Codec(), getU32Codec())],
]);

const myToken = {
    amount: 1000000000000000n, // `bigint` or `number` is supported
    decimals: 2,
    name: 'My Token',
};

const myEncodedToken: Uint8Array = structCodec.encode(myToken);
const myDecodedToken = structCodec.decode(myEncodedToken);

myDecodedToken satisfies {
    amount: bigint;
    decimals: number;
    name: string;
};
```

You may only need to encode or decode data, but not both. Importing one or the other allows your optimizing compiler to tree-shake the other implementation away:

```ts
import { Codec, combineCodec, Decoder, Encoder, addDecoderSizePrefix, addEncoderSizePrefix } from '@solana/codecs-core';
import { getStructDecoder, getStructEncoder } from '@solana/codecs-data-structures';
import {
    getU8Decoder,
    getU8Encoder,
    getU32Decoder,
    getU32Encoder,
    getU64Decoder,
    getU64Encoder,
} from '@solana/codecs-numbers';
import { getUtf8Decoder, getUtf8Encoder } from '@solana/codecs-strings';

export type MyToken = {
    amount: bigint;
    decimals: number;
    name: string;
};

export type MyTokenArgs = {
    amount: number | bigint;
    decimals: number;
    name: string;
};

export const getMyTokenEncoder = (): Encoder<MyTokenArgs> =>
    getStructEncoder([
        ['amount', getU64Encoder()],
        ['decimals', getU8Encoder()],
        ['name', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
    ]);

export const getMyTokenDecoder = (): Decoder<MyToken> =>
    getStructDecoder([
        ['amount', getU64Decoder()],
        ['decimals', getU8Decoder()],
        ['name', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ]);

export const getMyTokenCodec = (): Codec<MyTokenArgs, MyToken> =>
    combineCodec(getMyTokenEncoder(), getMyTokenDecoder());
```

You can read me about codecs in [the official Codec documentation](https://github.com/solana-labs/solana-web3.js/blob/master/packages/codecs/README.md).

## Type-Safety

The new library makes use of some advanced TypeScript features, including generic types, conditional types, `Parameters<..>`, `ReturnType<..>` and more.

We’ve described the RPC API in detail so that TypeScript can determine the _exact_ type of the result you will receive from the server given a particular input. Change the type of the input, and you will see the return type reflect that change.

### RPC Types

The RPC methods – both HTTP and subscriptions – are built with multiple overloads and conditional types. The expected HTTP response payload or subscription message format will be reflected in the return type of the function you’re working with when you provide the inputs in your code.

Here’s an example of this in action:

```ts
// Provide one set of parameters, get a certain type
// These parameters resolve to return type:
// {
//     blockhash: Blockhash;
//     blockHeight: bigint;
//     blockTime: UnixTimestampUnsafeBeyond2Pow53Minus1;
//     parentSlot: bigint;
//     previousBlockhash: Blockhash;
// }
const blockResponse = await rpc
    .getBlock(0n, {
        rewards: false,
        transactionDetails: 'none',
    })
    .send();

// Switch `rewards` to `true`, get `rewards` in the return type
// {
//     /* ... Previous response */
//     rewards: Reward[];
// }
const blockWithRewardsResponse = await rpc
    .getBlock(0n, {
        rewards: true,
        transactionDetails: 'none',
    })
    .send();

// Switch `transactionDetails` to `full`, get `transactions` in the return type
// {
//     /* ... Previous response */
//     transactions: TransactionResponse[];
// }
const blockWithRewardsAndTransactionsResponse = await rpc
    .getBlock(0n, {
        rewards: true,
        transactionDetails: 'full',
    })
    .send();
```

### Catching Compile-Time Bugs with TypeScript

As previously mentioned, the type coverage in version 2.0 allows developers to catch common bugs at compile time, rather than runtime.

In the example below, a transaction message is created and then attempted to be signed without setting the fee payer. This would result in a runtime error from the RPC, but instead you will see a type error from TypeScript as you type:

```ts
const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
    setTransactionMessageLifetimeUsingBlockhash(recentBlockhash, tx),
);
const signedTransaction = await signTransaction([keyPair], transactionMessage); // ERROR: Property 'feePayer' is missing in type
```

Consider another example where a developer is attempting to send a transaction that has not been fully signed. Again, the TypeScript compiler will throw a type error:

```ts
const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayer(feePayerAddress, tx),
    tx => setTransactionMessageLifetimeUsingBlockhash(recentBlockhash, tx),
);

const signedTransaction = await signTransaction([], transactionMessage);

// Asserts the transaction is a `FullySignedTransaction`
// Throws an error if any signatures are missing!
assertTransactionIsFullySigned(signedTransaction);

await sendAndConfirmTransaction(signedTransaction);
```

Are you building a nonce transaction and forgot to make `AdvanceNonce` the first instruction? That’s a type error:

```ts
const feePayer = await generateKeyPair();
const feePayerAddress = await getAddressFromPublicKey(feePayer.publicKey);

const notNonceTransactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
    setTransactionMessageFeePayer(feePayerAddress, tx),
);

notNonceTransactionMessage satisfies TransactionMessageWithDurableNonceLifetime;
// => Property 'lifetimeConstraint' is missing in type

const nonceConfig = {
    nonce: 'nonce' as Nonce,
    nonceAccountAddress: address('5tLU66bxQ35so2bReGcyf3GfMMAAauZdNA1N4uRnKQu4'),
    nonceAuthorityAddress: address('GDhj8paPg8woUzp9n8fj7eAMocN5P7Ej3A7T9F5gotTX'),
};

const stillNotNonceTransactionMessage = {
    lifetimeConstraint: nonceConfig,
    ...notNonceTransactionMessage,
};

stillNotNonceTransactionMessage satisfies TransactionMessageWithDurableNonceLifetime;
// => 'readonly IInstruction<string>[]' is not assignable to type 'readonly [AdvanceNonceAccountInstruction<string, string>, ...IInstruction<string>[]]'

const validNonceTransactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayer(feePayerAddress, tx),
    tx => setTransactionMessageLifetimeUsingDurableNonce(nonceConfig, tx), // Adds the instruction!
);

validNonceTransactionMessage satisfies TransactionMessageWithDurableNonceLifetime; // OK
```

The library’s type-checking can even catch you using lamports instead of SOL for a value:

```ts
const airdropAmount = 1n; // SOL
const signature = rpc.requestAirdrop(myAddress, airdropAmount).send();
```

It will force you to cast the numerical value for your airdrop (or transfer, etc.) amount using `lamports()`, which should be a good reminder!

```ts
const airdropAmount = lamports(1000000000n);
const signature = rpc.requestAirdrop(myAddress, airdropAmount).send();
```

## Compatibility Layer

You will have noticed by now that web3.js is a complete and total breaking change from the 1.x line. We want to provide you with a strategy for interacting with 1.x APIs while building your application using 2.0. You need a tool for commuting between 1.x and 2.0 data types.

The `@solana/compat` library allows for interoperability between functions and class objects from the legacy library - such as `VersionedTransaction`, `PublicKey`, and `Keypair` - and functions and types of the new library - such as `Address`, `Transaction`, and `CryptoKeyPair`.

Here’s how you can use `@solana/compat` to convert from a legacy `PublicKey` to an `Address`:

```ts
import { fromLegacyPublicKey } from '@solana/compat';

const publicKey = new PublicKey('B3piXWBQLLRuk56XG5VihxR4oe2PSsDM8nTF6s1DeVF5');
const address: Address = fromLegacyPublicKey(publicKey);
```

Here’s how to convert from a legacy `Keypair` to a `CryptoKeyPair`:

```ts
import { fromLegacyKeypair } from '@solana/compat';

const keypairLegacy = Keypair.generate();
const cryptoKeyPair: CryptoKeyPair = fromLegacyKeypair(keypair);
```

Here’s how to convert legacy transaction objects to the new library’s transaction types:

```ts
// Note that you can only convert `VersionedTransaction` objects
const modernTransaction = fromVersionedTransaction(classicTransaction);
```

To see more conversions supported by `@solana/compat`, you can check out the package’s [README on GitHub](https://github.com/solana-labs/solana-web3.js/blob/master/packages/compat/README.md).

## Program Clients

Writing JavaScript clients for on-chain programs has been done manually up until now. Without an IDL for some of the native programs, this process has been necessarily manual and has resulted in clients that lag behind the actual capabilities of the programs themselves.

We think that program clients should be _generated_ rather than written. Developers should be able to write Rust programs, compile the program code, and generate all of the JavaScript client-side code to interact with the program.

We use [Kinobi](https://github.com/metaplex-foundation/kinobi) to represent Solana programs and generate clients for them. This includes a JavaScript client compatible with this library. For instance, here is how you’d construct a transaction message composed of instructions from three different core programs.

```ts
import { appendTransactionMessageInstructions, createTransactionMessage, pipe } from '@solana/web3.js';
import { getAddMemoInstruction } from '@solana-program/memo';
import { getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';
import { getTransferSolInstruction } from '@solana-program/system';

const instructions = [
    getSetComputeUnitLimitInstruction({ units: 600_000 }),
    getTransferSolInstruction({ source, destination, amount: 1_000_000_000 }),
    getAddMemoInstruction({ memo: "I'm transferring some SOL!" }),
];

// Creates a V0 transaction message with 3 instructions inside.
const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
    appendTransactionMessageInstructions(instructions, tx),
);
```

As you can see, each program now generates its own library allowing you to cherry-pick your dependencies.

Note that asynchronous versions may be available for some instructions which allows them to resolve more inputs on your behalf — such as PDA derivation. For instance, the `CreateLookupTable` instruction offers an asynchronous builder that derives the `address` account and the `bump` argument for us.

```ts
const rpc = createSolanaRpc('http://127.0.0.1:8899');
const [authority, recentSlot] = await Promise.all([
    generateKeyPairSigner(),
    rpc.getSlot({ commitment: 'finalized' }).send(),
]);

const instruction = await getCreateLookupTableInstructionAsync({
    authority,
    recentSlot,
});
```

Alternatively, you may use the synchronous builder if you already have all the required inputs at hand.

```ts
const [address, bump] = await findAddressLookupTablePda({
    authority: authority.address,
    recentSlot,
});

const instruction = getCreateLookupTableInstruction({
    address,
    authority,
    bump,
    recentSlot,
});
```

On top of instruction builders, these clients offer a variety of utilities such as:

-   Instruction codecs — e.g. `getTransferSolInstructionDataCodec`.
-   Account types — e.g. `AddressLookupTable`.
-   Account codecs — e.g. `getAddressLookupTableAccountDataCodec`.
-   Account helpers — e.g. `fetchAddressLookupTable`.
-   PDA helpers — e.g. `findAddressLookupTablePda`, `fetchAddressLookupTableFromSeeds`.
-   Defined types and their codecs — e.g. `NonceState`, `getNonceStateCodec`.
-   Program helpers — e.g. `SYSTEM_PROGRAM_ADDRESS`, `SystemAccount` enum, `SystemAccount` enum, `identifySystemInstruction`.
-   And much more!

Here’s another example that fetches an `AddressLookupTable` PDA from its seeds.

```ts
const account = await fetchAddressLookupTableFromSeeds(rpc, {
    authority: authority.address,
    recentSlot,
});

account.address; // Address
account.lamports; // LamportsUnsafeBeyond2Pow53Minus1
account.data.addresses; // Address[]
account.data.authority; // Some<Address>
account.data.deactivationSlot; // Slot
account.data.lastExtendedSlot; // Slot
account.data.lastExtendedSlotStartIndex; // number
```

### How Does This Work?

All of this code is 100% auto-generated by Kinobi from a tree of standardized nodes that represent our programs. It contains obvious nodes such as `AccountNode` but also more specified nodes such as `ConditionalValueNode` that allows us to resolve account or argument default values conditionally.

Kinobi allows us to hydrate our tree of nodes from IDLs which are typically generated by program frameworks such as [Anchor](https://github.com/coral-xyz/anchor) or [Shank](https://github.com/metaplex-foundation/shank). Additionally, visitors can be used on our nodes to expand the knowledge of our programs since the IDL itself doesn’t yet contain that level of information. Finally, special visitors called ‘renderers’ visit our tree to generate clients such as this JavaScript client.

Currently, there is one other renderer that generates Rust clients but this is only the beginning. In the future, you can expect renderers for auto-generated Python clients, documentation, CLIs, etc.

## Create Solana Program

We believe the whole ecosystem could benefit from generated program clients. That’s why we introduced a new NPM binary that allows you to create your Solana program — and generate clients for it — in no time. Simply run the following and follow the prompts to get started.

```sh
pnpm create solana-program
```

This [`create-solana-program`](https://github.com/solana-program/create-solana-program) installer will create a new repository including:

-   An example program using the framework of your choice (Anchor coming soon).
-   Generated clients for any of the selected clients.
-   A set of scripts that allows you to:
    -   Start a local validator including all programs and accounts you depend on.
    -   Build, lint and test your programs.
    -   Generate IDLs from your programs.
    -   Generate clients from the generated IDLs.
    -   Build and test each of your clients.
-   GitHub Actions pipelines to test your program, test your clients, and even manually publish new packages or crates for your clients. (Coming soon).

When selecting the JavaScript client, you will get a fully generated library compatible with the new web3.js much like the `@solana-program` packages showcased above.

## GraphQL

Though not directly related to web3.js, we wanted to hijack your attention to show you something else that we’re working on, of particular interest to frontend developers. It’s a new API for interacting with the RPC: a GraphQL API.

The `@solana/rpc-graphql` package can be used to make GraphQL queries to Solana RPC endpoints, using the same transports described above (including any customizations).

Here’s an example of retrieving account data with GraphQL:

```ts
const source = `
    query myQuery($address: String!) {
        account(address: $address) {
            dataBase58: data(encoding: BASE_58)
            dataBase64: data(encoding: BASE_64)
            lamports
        }
    }
`;

const variableValues = {
    address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
};

const result = await rpcGraphQL.query(source, variableValues);

expect(result).toMatchObject({
    data: {
        account: {
            dataBase58: '2Uw1bpnsXxu3e',
            dataBase64: 'dGVzdCBkYXRh',
            lamports: 10290815n,
        },
    },
});
```

Using GraphQL allows developers to only specify which fields they _actually_ need, and do away with the rest of the response.

However, GraphQL is also extremely powerful for **nesting queries**, which can be particularly useful if you want to, say, get the **sum** of every lamports balance of every **owner of the owner** of each token account, while discarding any mint accounts.

```ts
const source = `
    query getLamportsOfOwnersOfOwnersOfTokenAccounts {
        programAccounts(programAddress: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") {
            ... on TokenAccount {
                owner {
                    ownerProgram {
                        lamports
                    }
                }
            }
        }
    }
`;

const result = await rpcGraphQL.query(source);

const sumOfAllLamportsOfOwnersOfOwnersOfTokenAccounts = result
    .map(o => o.account.owner.ownerProgram.lamports)
    .reduce((acc, lamports) => acc + lamports, 0);
```

The new GraphQL package supports this same style of nested querying on transactions and blocks.

```ts
const source = `
    query myQuery($signature: String!, $commitment: Commitment) {
        transaction(signature: $signature, commitment: $commitment) {
            message {
                instructions {
                    ... on CreateAccountInstruction {
                        lamports
                        programId
                        space
                    }
                }
            }
        }
    }
`;

const variableValues = {
    signature: '63zkpxATgAwXRGFQZPDESTw2m4uZQ99sX338ibgKtTcgG6v34E3MSS3zckCwJHrimS71cvei6h1Bn1K1De53BNWC',
    commitment: 'confirmed',
};

const result = await rpcGraphQL.query(source, variableValues);

expect(result).toMatchObject({
    data: {
        transaction: {
            message: {
                instructions: expect.arrayContaining([
                    {
                        lamports: expect.any(BigInt),
                        programId: '11111111111111111111111111111111',
                        space: expect.any(BigInt),
                    },
                ]),
            },
        },
    },
});
```

See more in the package’s [README on GitHub](https://github.com/solana-labs/solana-web3.js/tree/master/packages/rpc-graphql).

## Development

You can see all development of this library and associated GraphQL tooling in the web3.js repository on GitHub.

-   https://github.com/solana-labs/solana-web3.js

You can follow along with program client generator development in the `@solana-program` org and the `@kinobi-so/kinobi` repository.

-   https://github.com/solana-program/
-   https://github.com/kinobi-so/kinobi

Solana Labs develops these tools in public, as open source. We encourage any and all developers who would like to work on these tools to contribute to the codebase.

## Thank you

We’re grateful that you have read this far. If you are interested in migrating an existing application to the new web3.js to take advantage of some of the benefits we’ve demonstrated, we want to give you some direct support. Reach out to [@steveluscher](https://t.me/steveluscher/) on Telegram to start a conversation.
