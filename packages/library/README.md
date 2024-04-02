[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/web3.js/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/web3.js/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/web3.js/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# Solana JavaScript SDK Technology Preview

If you build JavaScript applications on Solana, it’s likely you’ve worked with `@solana/web3.js` or a library powered by it. With 400K+ weekly downloads on npm, it’s the most-used library in the ecosystem for building program clients, web applications, block explorers, and more.

Here’s an example of a common code snippet from `@solana/web3.js`:

```tsx
const connection = new Connection('https://api.mainnet-beta.solana.com');
const instruction = SystemProgram.transfer({ fromPubkey, toPubkey, lamports });
const transaction = new Transaction().add(instruction);
await sendAndConfirmTransaction(connection, transaction, [payer]);
```

In response to your feedback, we began a process of modernizing the library to prepare for the next generation of Solana applications. A Technology Preview of the new web3.js is now available for you to evaluate.

**This library is experimental**. It is unsuitable for production use, because the API is unstable and may change without warning. If you want to build a production Solana application, use the [1.x branch](https://www.npmjs.com/package/@solana/web3.js).

## Installation

### For use in Node.js or a web application

```shell
npm install --save @solana/web3.js@tp2
```

### For use in a browser, without a build system

```html
<!-- Development (debug mode, unminified) -->
<script src="https://unpkg.com/@solana/web3.js@tp2/dist/index.development.js"></script>

<!-- Production (minified) -->
<script src="https://unpkg.com/@solana/web3.js@tp2/dist/index.production.min.js"></script>
```

What follows is an overview of _why_ the library was re-engineered, what changes have been introduced, and how the JavaScript landscape might look across Solana in the near future.

# Community feedback in action

We’re grateful to all of you for communicating the pain points you’ve experienced when developing Solana applications with web3.js. We’ve heard you loud and clear.

## Tree-shaking

The object-oriented design of the web3.js (1.x) API prevents optimizing compilers from being able to “tree-shake” unused code from your production builds. No matter how much of the web3.js API you use in your application, you have to package all of it.

Read more about tree-shaking here:

-   [Mozilla Developer Docs: Tree Shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)
-   [WebPack Docs: Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
-   [Web.Dev Blog Article: Reduce JavaScript Payloads with Tree Shaking](https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking)

One example of an API that can’t be tree-shaken is the `Connection` class. It has dozens of methods, but because it’s a _class_ you have no choice but to include every method in your application’s final bundle, no matter how many you _actually_ use.

Needlessly large JavaScript bundles can cause issues with deployments to cloud compute providers like Cloudflare or AWS Lambda. They also impact webapp startup performance because of longer download and JavaScript parse times.

## Opinionated

Depending on your use case and your tolerance for certain application behaviours, you may be willing to configure your application to make a different set of tradeoffs than another developer. The default tradeoffs that we codify into the web3.js API on the other hand have to work for as large a population as possible, in the common case.

The inability to customize web3.js has been a source of frustration for some:

-   The Mango team wanted to customize the transaction confirmation strategy, but all of that functionality is hidden away behind `confirmTransaction` – a static method of `Connection`. [Here’s the code for `confirmTransaction` on GitHub](https://github.com/solana-labs/solana-web3.js/blob/69a8ad25ef09f9e6d5bff1ffa8428d9be0bd32ac/packages/library-legacy/src/connection.ts#L3734).
-   Solana developer ‘mPaella’ [wanted us to add a feature in the RPC](https://github.com/solana-labs/solana-web3.js/issues/1143#issuecomment-1435927152) that would failover to a set of backup URLs in case the primary one failed.
-   Solana developer ‘epicfaace’ wanted first-class support for automatic time-windowed batching in the RPC transport. [Here’s their pull request](https://github.com/solana-labs/solana/pull/23628).
-   Multiple folks have expressed the need for custom retry logic for failed requests or transactions. [Here’s a pull request from ‘dafyddd’](https://github.com/solana-labs/solana/pull/11811) and [another from ‘abrkn’](https://github.com/solana-labs/solana-web3.js/issues/1041) attempting to modify retry logic to suit their individual use cases.

## Lagging Behind Modern JavaScript

The advance of modern JavaScript features presents an opportunity to developers of crypto applications, such as the ability to use native Ed25519 keys and to express large values as native `bigint`.

The Web Incubator Community Group has advocated for the addition of Ed25519 support to the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), and support has already landed in _most_ modern JavaScript runtimes.

Support for `bigint` values has also become commonplace. The older `number` primitive in JavaScript has a maximum value of 2^53 - 1, whereas Rust’s `u64` can represent values up to 2^64.

## Class-Based Architecture

The object oriented, class-based architecture of the legacy library causes unnecessary bundle bloat. Your application has no choice but to bundle _all_ of the functionality and dependencies of a class no matter how many methods you actually use at runtime.

Class-based architecture also presents unique risks to developers who trigger the dual-package hazard. This describes a situation you can find yourself in if you build for both CommonJS and ES modules. The situation arises when two “copies” of the same class are present in the dependency tree, causing checks like `instanceof` to fail, which introduces aggravating and difficult to debug problems.

Read more about dual-package hazard:

-   [NodeJS: Dual Package Hazard](https://nodejs.org/api/packages.html#dual-package-hazard)

# The New web3.js

Enter web3.js 2.0. The new API aims to deliver a re-imagined experience of building Solana applications, a high level of performance by default, and all with a minimum of code. From the ability to customize the behaviour of the library through composition, to the joy of being able to catch common errors during build time before they make it to production, we hope that you enjoy building with it as much as we’ve enjoyed creating it.

## Features

The new (2.0) version of `@solana/web3.js` aims to address shortcomings in the legacy library first, then goes even further.

### Tree-Shaking

The 2.0 library is tree-shakable, and that tree-shakeability is enforced in the CI. Anything you don’t use from web3.js 2.0 can now be discarded from your bundle by an optimizing compiler.

The new library itself is comprised of several smaller, modular packages under the `@solana` organization, including:

-   `@solana/accounts`: For fetching and decoding accounts
-   `@solana/codecs`: For composing data (de)serializers from a set of primitives or building custom ones
-   `@solana/errors`: For identifying and refining coded errors thrown in the `@solana` namespace
-   `@solana/rpc`: For sending RPC requests
-   `@solana/rpc-subscriptions`: For subscribing to RPC notifications
-   `@solana/signers`: For building message and/or transaction signer objects
-   `@solana/sysvars`: For fetching and decoding sysvar accounts
-   `@solana/transactions`: For building and transforming Solana transaction objects
-   And many more!

Some of these packages are themselves composed of smaller packages. For instance, `@solana/rpc` is composed of `@solana/rpc-spec` (for core JSON RPC specification types), `@solana/rpc-api` (for the Solana-specific RPC methods), `@solana/rpc-transport-http` (for the default HTTP transport) and so on.

Developers can use the default configurations within the library itself (`@solana/web3.js:2.0`) or import any number of the modular packages for additional customization.

### Minimally Opinionated

The individual modules that make up web3.js are assembled in a **default** configuration reminiscent of the legacy library as part of the npm package `@solana/web3.js`, but those who wish to assemble them in different configurations may do so.

Each package uses types and generics liberally, allowing you to inject new functionality, to make extensions to each API via composition and supertypes, and to encourage you to create higher-level opinionated abstractions of your own.

In fact, we expect you to do so, and to open source some of those for use by others with similar needs.

### Modern JavaScript

The new API is built for compatibility with platform APIs to reduce our dependencies on userspace implementations that introduce supply chain risk and bundle bloat to your applications.

One such example is the integration of Ed25519 `CryptoKeys` – native platform primitives for managing cryptographic keys and signatures.

Read more about the Web Crypto API here:

-   [Mozilla Developer Docs: Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
-   [Node JS Documentation: Web Crypto API](https://nodejs.org/api/webcrypto.html)
-   [Nieky Allen (Blog): The Web Crypto API in Action](https://medium.com/slalom-build/the-web-cryptography-api-in-action-89b2f68c602c)

web3.js 2.0 also further eliminates dependencies such as `BN.js` by implementing large integers with `bigint`.

### Interface-Based Architecture

The new library employs interfaces and types for just about _everything_, expressing most objects as data. The dual-package hazard is no longer a threat to your development; any objects compatible with an interface are usable with functions that specify that interface.

This interface-based approach also allows for easy customization; for extending the library’s functionality or building on top of it.

## Statistics

Consider these statistical comparisons between web3.js 2.0 and the legacy 1.x.

|                                                                                                             | 1.x (Legacy) | 2.0        | +/- % |
| ----------------------------------------------------------------------------------------------------------- | ------------ | ---------- | ----- |
| Total minified size of library                                                                              | 90 KB        | 33 KB      | -63%  |
| Total minified size of library (when runtime supports Ed25519)                                              | 90 KB        | 17 KB      | -81%  |
| Bundled size of a web application that only executes a transfer of lamports                                 | 67 KB        | 4.5 KB     | -93%  |
| Bundled size of a web application that only executes a transfer of lamports (when runtime supports Ed25519) | 67 KB        | 4.5 KB     | -93%  |
| Bundled size of a worker that signs and sends a transaction                                                 | 5.4 MB       | 1.7 MB     | -68%  |
| Performance of key generation, signing, and verifying signatures (Brave with Experimental API flag)         | 700 ops/s    | 7000 ops/s | +900% |
| First-load size for Solana Explorer                                                                         | 311 KB       | 228 KB     | -26%  |

The re-engineered library achieves these speedups and reductions in bundle size in large part through use of modern JavaScript APIs.

To validate our work, we replaced the legacy 1.x library with the new 2.0 library on the homepage of the Solana Explorer. Total first-load bundle size dropped by 26% without removing a single feature. [Here’s an X thread](https://twitter.com/callum_codes/status/1679124485218226176) by Callum McIntyre if you would like to dig deeper.

# A tour of the web3.js 2.0 API

Here’s an overview of how to use the new library to interact with the RPC, configure network transports, work with Ed25519 keys, and to serialize data.

## RPC

web3.js 2.0 ships with an implementation of the [JSON RPC specification](https://www.jsonrpc.org/specification) and a type spec for the [Solana JSON RPC](https://docs.solana.com/api).

The main package responsible for managing communication with an RPC is `@solana/rpc`. However, this package makes use of more granular packages to break down the RPC logic into smaller pieces. Namely, these packages are:

-   `@solana/rpc`: Contains all logic related to sending Solana RPC calls.
-   `@solana/rpc-api`: Describes all Solana RPC methods using types.
-   `@solana/rpc-transport-http`: Provides a concrete implementation of an RPC transport using HTTP requests.
-   `@solana/rpc-spec`: Defines the JSON RPC spec for sending RPC requests.
-   `@solana/rpc-spec-types`: Shared JSON RPC specifications types and helpers that are used by both `@solana/rpc` and `@solana/rpc-subscriptions` (described in the next section).
-   `@solana/rpc-types`: Shared Solana RPC types and helpers that are used by both `@solana/rpc` and `@solana/rpc-subscriptions`.

That being said, the main `@solana/web3.js` library re-exports the `@solana/rpc` package so, going forward, we will import RPC types and functions from the library directly.

### Getting Started with RPC Calls

To get started with RPC calls, you may use the `createSolanaRpc` function by providing the URL of the Solana JSON RPC server. This will create a default client for interacting with the Solana JSON RPC.

```tsx
import { createSolanaRpc } from '@solana/web3.js';

// Create an RPC client.
const rpc = createSolanaRpc('http://127.0.0.1:8899');
//    ^? Rpc<SolanaRpcApi>

// Send a request.
const slot = await rpc.getSlot().send();
```

### Using Custom RPC Transports

The `createSolanaRpc` function communicates with the RPC server using a default HTTP transport that should satisfy most use cases. However, you may provide your own transport or decorate existing ones to communicate with RPC servers in any way you see fit. In the example below, we explicitly create a transport and use it to create a new RPC client via the `createSolanaRpcFromTransport` function.

```tsx
import { createSolanaRpcFromTransport, createDefaultRpcTransport } from '@solana/web3.js';

// Create an HTTP transport or any custom transport of your choice.
const transport = createDefaultRpcTransport({ url: 'https://api.devnet.solana.com' });

// Create an RPC client using that transport.
const rpc = createSolanaRpcFromTransport(transport);
//    ^? Rpc<SolanaRpcApi>

// Send a request.
const slot = await rpc.getSlot().send();
```

Using custom RPC transports, one can implement highly specialized functionality for leveraging multiple transports, attempting/handling retries, and more. Let's take a look at some concrete examples.

#### Round Robin

Here’s an example of how someone might implement a “round robin” approach to leveraging multiple RPC transports within their application:

```tsx
import { createDefaultRpcTransport, createSolanaRpcFromTransport, type RpcTransport } from '@solana/web3.js';

// Create an HTTP transport for each RPC server.
const transports = [
    createDefaultRpcTransport({ url: 'https://mainnet-beta.my-server-1.com' }),
    createDefaultRpcTransport({ url: 'https://mainnet-beta.my-server-2.com' }),
    createDefaultRpcTransport({ url: 'https://mainnet-beta.my-server-3.com' }),
];

// Set up the round-robin factory.
let nextTransport = 0;
async function roundRobinTransport<TResponse>(...args: Parameters<RpcTransport>): Promise<TResponse> {
    const transport = transports[nextTransport];
    nextTransport = (nextTransport + 1) % transports.length;
    return await transport(...args);
}

// Create the RPC client using the round-robin transport.
const rpc = createSolanaRpcFromTransport(roundRobinTransport);
```

#### Sharding

Another example of a possible customization for RPC transports is sharding. Here’s an example:

```tsx
// TODO: Your turn; send us a pull request with an example.
```

#### Retry Logic

The transport library can also be used to implement custom retry logic on any request:

```tsx
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

Support for handling failover can be implemented as a first-class citizen in your application using the new transport library. Here’s an example of some failover logic integrated into a transport:

```tsx
// TODO: Your turn; send us a pull request with an example.
```

#### Fanning Out

Perhaps your application needs to make a large number of requests or needs to fan requests for different methods out to different servers. Here’s an example of an implementation that does the latter:

```tsx
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

const rpc = createSolanaRpcFromTransport(async <TResponse>(...args: Parameters<RpcTransport>): Promise<TResponse> => {
    const payload = args[0].payload as { method: string };
    const selectedTransport = selectShard(payload.method);
    return (await selectedTransport(...args)) as TResponse;
});
```

### Scoping the RPC API

Using the `createSolanaRpc` or `createSolanaRpcFromTransport` methods, we always get the same RPC API, including all Solana RPC methods. However, since the RPC API is described using types only, it is possible to scope the API to a specific set of methods and even add your own custom methods.

When reducing the API scope, keep in mind that types don’t affect bundle size. However, you may choose to scope the type-spec for a variety of reasons, including reducing TypeScript noise.

#### Scoping by Cluster

If you're using a specific cluster, you may wrap your RPC URL inside a helper function like `mainnet` or `devnet` to inject that information into the RPC type system.

```ts
import { createSolanaRpc, mainnet, devnet } from '@solana/web3.js';

const mainnetRpc = createSolanaRpc(mainnet('https://api.mainnet-beta.solana.com'));
//    ^? RpcMainnet<SolanaRpcApiMainnet>

const devnetRpc = createSolanaRpc(devnet('https://api.devnet.solana.com'));
//    ^? RpcDevnet<SolanaRpcApiDevnet>
```

In the example above, `devnetRpc.requestAirdrop(..)` will work, but `mainnetRpc.requestAirdrop(..)` will throw a TypeScript error as `requestAirdrop` is not a valid method of the mainnet cluster.

#### Cherry-Picking API Methods

You may reduce the scope of the API’s type-spec even further so you are left only with the methods you need. The simplest way to do this is to cast the created RPC client to a type that only includes the methods you need.

```ts
import { createSolanaRpc, type Rpc, type GetAccountInfoApi, type GetMultipleAccountsApi } from '@solana/web3.js';

const rpc = createSolanaRpc('http://127.0.0.1:8899') as Rpc<GetAccountInfoApi & GetMultipleAccountsApi>;
```

Alternatively, you may explicitly create the RPC API using the `createSolanaRpcApi` function. You will then need to create your own transport explicitly and bind the two together using the `createRpc` function.

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

Note that the `createSolanaRpcApi` function is a wrapper on top of the `createRpcApi` function which adds some Solana-specific transformers such as setting a default commitment on all methods or throwing an error when an integer overflow is detected.

#### Creating your Own API Methods

The new library’s RPC specification supports an _infinite_ number of JSON-RPC methods with **zero increase** in bundle size.

This means the library can support future additions to the official [Solana JSON RPC](https://docs.solana.com/api), or [custom RPC methods](https://www.quicknode.com/docs/ethereum/qn_fetchNFTCollectionDetails_v2) defined by some development team – for example, QuickNode or Helius.

Here’s an example of how a developer at QuickNode might build a custom RPC type-spec for their in-house RPC methods:

```tsx
// Define the method's response payload.
type NftCollectionDetailsApiResponse = Readonly<{
    address: string;
    circulatingSupply: number;
    description: string;
    erc721: boolean;
    erc1155: boolean;
    genesisBlock: string;
    genesisTransaction: string;
    name: string;
    totalSupply: number;
}>;

// Set up an interface for the request method.
interface NftCollectionDetailsApi {
    // Define the method's name, parameters and response type
    qn_fetchNFTCollectionDetails(args: { contracts: string[] }): NftCollectionDetailsApiResponse;
}

// Export the type spec for downstream users.
export type QuickNodeRpcApi = NftCollectionDetailsApi;
```

Here’s how a developer might use it:

```tsx
import { createDefaultRpcTransport, createRpc, createRpcApi } from '@solana/web3.js';

// Create the custom API.
const api = createRpcApi<QuickNodeRpcApi>();

// Set up an HTTP transport.
const transport = createDefaultRpcTransport({ url: 'http://127.0.0.1:8899' });

// Create the RPC client.
const quickNodeRpc = createRpc({ api, transport });
//    ^? Rpc<QuickNodeRpcApi>
```

As long as a particular JSON RPC method adheres to the [official JSON RPC specification](https://www.jsonrpc.org/specification), it will be supported by web3.js 2.0.

### Aborting RPC Requests

RPC requests are now abortable with modern `AbortControllers`. When calling an RPC method such as `getSlot`, it will return a `PendingRpcRequest` proxy object that contains a `send` method to send the request to the server.

```ts
const pendingRequest: PendingRpcRequest<Slot> = rpc.getSlot();

const slot: Slot = await pendingRequest.send();
```

Since the arguments of the `getSlot` method are reserved for the request payload, the `send` method is the one that can accept additional arguments such as an `AbortSignal` to abort the request.

Aborting RPC requests can be useful for a variety of things such as setting a timeout on a request or cancelling a request when a user navigates away from a page.

```tsx
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

Read more about `AbortController` at the following links:

-   [Mozilla Developer Docs: `AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
-   [Mozilla Developer Docs: `AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
-   [JavaScript.info: Fetch: Abort](https://javascript.info/fetch-abort)

## RPC Subscriptions

Subscriptions in the legacy library do not allow custom retry logic and do not allow you to recover from potentially missed messages. The new version does away with silent retries, surfaces transport errors to your application, and gives you the opportunity to recover from gap events.

The main package responsible for managing communication with RPC subscriptions is `@solana/rpc-subscriptions`. However, similarly to `@solana/rpc`, this package also makes use of more granular packages. These packages are:

-   `@solana/rpc-subscriptions`: Contains all logic related to subscribing to Solana RPC notifications.
-   `@solana/rpc-subscriptions-api`: Describes all Solana RPC subscriptions using types.
-   `@solana/rpc-subscriptions-transport-websocket`: Provides a concrete implementation of an RPC Subscriptions transport using WebSockets.
-   `@solana/rpc-subscriptions-spec`: Defines the JSON RPC spec for subscribing to RPC notifications.
-   `@solana/rpc-spec-types`: Shared JSON RPC specifications types and helpers that are used by both `@solana/rpc` and `@solana/rpc-subscriptions`.
-   `@solana/rpc-types`: Shared Solana RPC types and helpers that are used by both `@solana/rpc` and `@solana/rpc-subscriptions`.

Since the main `@solana/web3.js` library also re-exports the `@solana/rpc-subscriptions` package we will import RPC Subscriptions types and functions directly from the main library going forward.

### Getting Started with RPC Subscriptions

To get started with RPC Subscriptions, you may use the `createSolanaRpcSubscriptions` function by providing the WebSocket URL of the Solana JSON RPC server. This will create a default client for interacting with Solana RPC Subscriptions.

```tsx
import { createSolanaRpcSubscriptions } from '@solana/web3.js';

// Create an RPC Subscriptions client.
const rpcSubscriptions = createSolanaRpcSubscriptions('ws://127.0.0.1:8900');
//    ^? RpcSubscriptions<SolanaRpcSubscriptionsApi>
```

### Subscriptions as Async Iterators

The new subscriptions API vends subscription notifications as an `AsyncIterator`. The `AsyncIterator` conforms to the [async iterator protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols), which allows developers to consume messages using a `for await...of` loop.

Here’s an example of working with a subscription in the new library:

```tsx
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

```tsx
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

```tsx
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

### Failed versus Aborted Subscriptions

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

```tsx
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

The `createSolanaRpcSubscriptions` function communicates with the RPC server using a default WebSocket transport that should satisfy most use cases. However, you may here as well provide your own transport or decorate existing ones to communicate with RPC servers in any way you see fit. In the example below, we explicitly create a WebSocket transport and use it to create a new RPC Subscriptions client via the `createSolanaRpcSubscriptionsFromTransport` function.

```tsx
import { createDefaultRpcSubscriptionsTransport, createSolanaRpcSubscriptionsFromTransport } from '@solana/web3.js';

// Create a WebSocket transport or any custom transport of your choice.
const transport = createDefaultRpcSubscriptionsTransport({ url: 'ws://127.0.0.1:8900' });

// Create an RPC client using that transport.
const rpcSubscriptions = createSolanaRpcSubscriptionsFromTransport(transport);
//    ^? RpcSubscriptions<SolanaRpcSubscriptionsApi>
```

### Scoping the RPC Subscriptions API

Using the `createSolanaRpcSubscriptions` or `createSolanaRpcSubscriptionsFromTransport` functions, we always get the same RPC Subscriptions API, including all Solana RPC stable subscriptions. However, since the RPC Subscriptions API is described using types only, it is possible to scope the API to a specific set of subscriptions and even add your own custom subscriptions.

#### Scoping by Cluster

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
    createSolanaRpcSubscriptions_UNSTABLE,
    createSolanaRpcSubscriptionsFromTransport_UNSTABLE,
} from '@solana/web3.js';

// Using the default WebSocket transport.
const rpcSubscriptions = createSolanaRpcSubscriptions_UNSTABLE('ws://127.0.0.1:8900');
//    ^? RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>

// Using a custom transport.
const transport = createDefaultRpcSubscriptionsTransport({ url: 'ws://127.0.0.1:8900' });
const rpcSubscriptions = createSolanaRpcSubscriptionsFromTransport_UNSTABLE(transport);
//    ^? RpcSubscriptions<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>
```

#### Cherry-Picking API Methods

You may reduce the scope of the Subscription API even further so you are left only with the subscriptions you need. The simplest way to do this is to cast the created RPC client to a type that only includes the methods you need.

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
    createDefaultRpcSubscriptionsTransport,
    createSubscriptionRpc,
    createSolanaRpcSubscriptionsApi,
    DEFAULT_RPC_CONFIG,
    type AccountNotificationsApi,
    type SlotNotificationsApi,
} from '@solana/web3.js';

const api = createSolanaRpcSubscriptionsApi<AccountNotificationsApi & SlotNotificationsApi>(DEFAULT_RPC_CONFIG);
const transport = createDefaultRpcSubscriptionsTransport({ url: 'ws://127.0.0.1:8900' });
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

```tsx
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

```tsx
import '@solana/webcrypto-ed25519-polyfill';
import { generateKeyPair, signBytes, verifySignature } from '@solana/web3.js';

const keyPair: CryptoKeyPair = await generateKeyPair();

/* Remaining logic */
```

You can see where Ed25519 is currently supported in [this GitHub issue](https://github.com/WICG/webcrypto-secure-curves/issues/20) on the Web Crypto repository. Consider sniffing the user-agent when deciding whether or not to deliver the polyfill to browsers.

Operations on `CryptoKey` objects using the Web Crypto API _or_ the polyfill are mostly handled by the `@solana/keys` package.

### String Addresses

All addresses are now JavaScript strings. They are represented by the opaque type `Address`, which describes exactly what a Solana address actually is.

Consequently, that means no more `PublicKey`.

Here’s what they look like in development:

```tsx
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

Just like many other familiar aspects of the 1.0 library, transactions have received a makeover as well.

For starters, all transactions are now version-aware, so there’s no longer a need to juggle two different types of transactions (`Transaction` vs. `VersionedTransaction`).

Address lookups are now completely described inside transaction instructions, so you don’t have to materialize `addressTableLookups` from the transaction object anymore.

Here’s a simple example of creating a transaction – notice how the type of the transaction is refined at each step of the process:

```tsx
import {
    address,
    createTransaction,
    setTransactionFeePayer,
    setTransactionLifetimeUsingBlockhash,
    Blockhash,
} from '@solana/web3.js';

const recentBlockhash = {
    blockhash: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY' as Blockhash,
    lastValidBlockHeight: 196055492n,
};
const feePayer = address('AxZfZWeqztBCL37Mkjkd4b8Hf6J13WCcfozrBY6vZzv3');

// Create a new transaction (legacy)
const transactionLegacy = createTransaction({ version: 'legacy' });
//    ^? LegacyTransaction

const transactionWithFeePayerLegacy = setTransactionFeePayer(feePayer, transactionLegacy);
//    ^? LegacyTransaction & ITransactionWithFeePayer

const transactionWithFeePayerAndLifetimeLegacy = setTransactionLifetimeUsingBlockhash(
    recentBlockhash,
    transactionWithFeePayerLegacy,
);
//    ^? LegacyTransaction & ITransactionWithFeePayer & ITransactionWithBlockhash

// Create a new transaction (v0)
const transactionV0 = createTransaction({ version: 0 });
//    ^? V0Transaction

// Set the fee payer
const transactionWithFeePayerV0 = setTransactionFeePayer(feePayer, transactionV0);
//    ^? V0Transaction & ITransactionWithFeePayer

const transactionWithFeePayerAndLifetimeV0 = setTransactionLifetimeUsingBlockhash(
    recentBlockhash,
    transactionWithFeePayerV0,
);
//    ^? V0Transaction & ITransactionWithFeePayer & ITransactionWithBlockhash
```

As you can see, each time a transaction is modified, the type reflects the current state. If you add a fee payer, you’ll get a type representing a transaction with a fee payer, and so on.

Additionally, transaction-modifying methods such as `setTransactionFeePayer(..)` and `setTransactionLifetimeUsingBlockhash(..)` will strip a transaction of its signatures, since those signatures would no longer match the modified transaction message.

```tsx
import {
    address,
    createTransaction,
    generateKeyPair,
    setTransactionFeePayer,
    setTransactionLifetimeUsingBlockhash,
    signTransaction,
    Blockhash,
} from '@solana/web3.js';

const recentBlockhash = {
    blockhash: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY' as Blockhash,
    lastValidBlockHeight: 196055492n,
};
const feePayer = address('AxZfZWeqztBCL37Mkjkd4b8Hf6J13WCcfozrBY6vZzv3');
const signer = await generateKeyPair();

const transaction = createTransaction({ version: 'legacy' });
const transactionWithFeePayer = setTransactionFeePayer(feePayer, transaction);
const transactionWithFeePayerAndLifetime = setTransactionLifetimeUsingBlockhash(
    recentBlockhash,
    transactionWithFeePayer,
);
const transactionSignedWithFeePayerAndLifetime = await signTransaction([signer], transactionWithFeePayerAndLifetime);
//    ^? LegacyTransaction & ITransactionWithFeePayer & ITransactionWithBlockhash & ITransactionWithSignatures

// Setting the lifetime again will remove the signatures from the object
const transactionSignaturesStripped = setTransactionLifetimeUsingBlockhash(
    recentBlockhash,
    transactionSignedWithFeePayerAndLifetime,
);
//    ^? LegacyTransaction & ITransactionWithFeePayer & ITransactionWithBlockhash
```

The `signTransaction(..)` function will raise a type error if your unsigned transaction is not already equipped with a fee payer and a lifetime.

```tsx
const feePayer = address('AxZfZWeqztBCL37Mkjkd4b8Hf6J13WCcfozrBY6vZzv3');
const signer = await generateKeyPair();

const transaction = createTransaction({ version: 'legacy' });
const transactionWithFeePayer = setTransactionFeePayer(feePayer, transaction);

// Attempting to sign the transaction without a lifetime will throw a type error
const transactionSignedWithFeePayer = await signTransaction([signer], transactionWithFeePayer);
// => "Property 'lifetimeConstraint' is missing in type"
```

Transaction objects are also **frozen by these functions** to prevent transactions from being mutated in place by functions you pass them to.

Building transactions in this manner might feel different from what you’re used to. Also, we certainly wouldn’t want you to have to bind transformed transactions to a new variable at each step, so we have released a functional programming library dubbed `@solana/functional` that lets you build transactions in **pipelines**. Here’s how it can be used:

```tsx
import { pipe } from '@solana/functional';
import {
    address,
    Blockhash,
    createTransaction,
    setTransactionFeePayer,
    setTransactionLifetimeUsingBlockhash,
} from '@solana/web3.js';

// Use `pipe(..)` to create a pipeline of transaction transform operations
const transaction = pipe(
    createTransaction({ version: 0 }),
    tx => setTransactionFeePayer(feePayer, tx),
    tx => setTransactionLifetimeUsingBlockhash(recentBlockhash, tx),
);
```

Note that `pipe(..)` is completely decoupled from transactions, so it can be used to pipeline any compatible transforms.

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

```tsx
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

```tsx
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

```tsx
// Provide one set of parameters, get a certain type
// These parameters resolve to return type:
// {
//     blockhash: Blockhash;
//     blockHeight: bigint;
//     blockTime: UnixTimestamp;
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

As previously mentioned, the type coverage in web3.js 2.0 allows developers to catch common bugs at compile time, rather than runtime.

In the example below, a transaction is created and then attempted to be compiled without setting the fee payer. This would result in a runtime error from the RPC, but instead you will see a type error from TypeScript as you type:

```tsx
const encodedTx = pipe(
    createTransaction({ version: 0 }),
    tx => setTransactionLifetimeUsingBlockhash(recentBlockhash, tx),
    tx => getBase64EncodedWireTransaction(tx), // Property 'feePayer' is missing in type
);
```

Consider another example where a developer is attempting to send a transaction that has not been fully signed. Again, the TypeScript compiler will throw a type error:

```tsx
const unsignedTransaction = pipe(
    createTransaction({ version: 0 }),
    tx => setTransactionFeePayer(feePayerAddress, tx),
    tx => setTransactionLifetimeUsingBlockhash(recentBlockhash, tx),
);

const signature = sendAndConfirmTransaction({
    confirmRecentTransaction: createDefaultRecentTransactionConfirmer({ rpc, rpcSubscriptions }),
    rpc,
    transaction: unsignedTransaction, // Transaction has not been signed: Type error
});

const transaction = await signTransaction([], unsignedTransaction);

// Asserts the transaction as a `IFullySignedTransaction`
// Throws an error if any signatures are missing!
assertTransactionIsFullySigned(transaction);
```

Are you working with a nonce transaction and forgot to make `AdvanceNonce` the first instruction? That’s a type error:

```tsx
const feePayer = await generateKeyPair();
const feePayerAddress = await getAddressFromPublicKey(feePayer.publicKey);

const notNonceTransaction = pipe(createTransaction({ version: 0 }), tx => setTransactionFeePayer(feePayerAddress, tx));

notNonceTransaction satisfies IDurableNonceTransaction;
// => Property 'lifetimeConstraint' is missing in type

const nonceConfig = {
    nonce: 'nonce' as Nonce,
    nonceAccountAddress: address('5tLU66bxQ35so2bReGcyf3GfMMAAauZdNA1N4uRnKQu4'),
    nonceAuthorityAddress: address('GDhj8paPg8woUzp9n8fj7eAMocN5P7Ej3A7T9F5gotTX'),
};

const stillNotNonceTransaction = {
    lifetimeConstraint: nonceConfig,
    ...notNonceTransaction,
};

stillNotNonceTransaction satisfies IDurableNonceTransaction;
// => 'readonly IInstruction<string>[]' is not assignable to type 'readonly [AdvanceNonceAccountInstruction<string, string>, ...IInstruction<string>[]]'

const validNonceTransaction = pipe(
    createTransaction({ version: 0 }),
    tx => setTransactionFeePayer(feePayerAddress, tx),
    tx => setTransactionLifetimeUsingDurableNonce(nonceConfig, tx), // Adds the instruction!
);

validNonceTransaction satisfies IDurableNonceTransaction; // OK
```

The library’s type-checking can even catch you using lamports instead of SOL for a value:

```tsx
const airdropAmount = 1n; // SOL
const signature = rpc.requestAirdrop(myAddress, airdropAmount).send();
```

It will force you to cast the numerical value for your airdrop (or transfer, etc.) amount using `lamports()`, which should be a good reminder!

```tsx
const airdropAmount = lamports(1000000000n);
const signature = rpc.requestAirdrop(myAddress, airdropAmount).send();
```

## Compatibility Layer

You will have noticed by now that web3.js is a complete and total breaking change from the 1.x line. We want to provide you with a strategy for interacting with 1.x APIs while building your application using 2.0. You need a tool for commuting between 1.x and 2.0 data types.

The `@solana/compat` library allows for interoperability between functions and class objects from the legacy library - such as `VersionedTransaction`, `PublicKey`, and `Keypair` - and functions and types of the new library - such as `Address`, `Transaction`, and `CryptoKeyPair`.

Here’s how you can use `@solana/compat` to convert from a legacy `PublicKey` to an `Address`:

```tsx
import { fromLegacyPublicKey } from '@solana/compat';

const publicKey = new PublicKey('B3piXWBQLLRuk56XG5VihxR4oe2PSsDM8nTF6s1DeVF5');
const address: Address = fromLegacyPublicKey(publicKey);
```

Here’s how to convert from a legacy `Keypair` to a `CryptoKeyPair`:

```tsx
import { fromLegacyKeypair } from '@solana/compat';

const keypairLegacy = Keypair.generate();
const cryptoKeyPair: CryptoKeyPair = fromLegacyKeypair(keypair);
```

Here’s how to convert legacy transaction objects to the new library’s transaction types:

```tsx
// For a transaction using a blockhash lifetime
const tx = fromVersionedTransactionWithBlockhash(legacyTransactionV0);
// You can also optionally provide a `lastValidBlockheight` parameter to manage retries
const tx = fromVersionedTransactionWithBlockhash(legacyTransactionV0, lastValidBlockheight);

// For a transaction using a durable nonce lifetime
const tx = fromVersionedTransactionWithDurableNonce(transaction);
// Again you can also optionally provide a `lastValidBlockheight`
const tx = fromVersionedTransactionWithDurableNonce(transaction, lastValidBlockheight);
```

To see more conversions supported by `@solana/compat`, you can check out the package’s [README on GitHub](https://github.com/solana-labs/solana-web3.js/blob/master/packages/compat/README.md).

## Program Clients

Writing JavaScript clients for on-chain programs has been done manually up until now. Without an IDL for some of the native programs, this process has been necessarily manual and has resulted in clients that lag behind the actual capabilities of the programs themselves.

We think that program clients should be _generated_ rather than written. Developers should be able to write Rust programs, compile the program code, and generate all of the JavaScript client-side code to interact with the program.

We use [Kinobi](https://github.com/metaplex-foundation/kinobi) to represent Solana programs and generate clients for them. This includes a JavaScript client compatible with this library. For instance, here is how you’d construct a transaction composed of instructions from three different core programs.

```tsx
import { createTransaction, pipe } from '@solana/web3.js';
import { getAddMemoInstruction } from '@solana-program/memo';
import { getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';
import { getTransferSolInstruction } from '@solana-program/system';

const instructions = [
    getSetComputeUnitLimitInstruction({ units: 600_000 }),
    getTransferSolInstruction({ source, destination, amount: 1_000_000_000 }),
    getAddMemoInstruction({ memo: "I'm transferring some SOL!" }),
];

// Creates a V0 transaction with 3 instructions inside.
const transaction = pipe(createTransaction({ version: 0 }), tx => appendTransactionInstructions(instructions, tx));
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

### How does this work?

All of this code is 100% auto-generated by Kinobi from a tree of standardized nodes that represent our programs. It contains obvious nodes such as `AccountNode` but also more specified nodes such as `ConditionalValueNode` that allows us to resolve account or argument default values conditionally.

Kinobi allows us to hydrate our tree of nodes from IDLs which are typically generated by program frameworks such as [Anchor](https://github.com/coral-xyz/anchor) or [Shank](https://github.com/metaplex-foundation/shank). Additionally, visitors can be used on our nodes to expand the knowledge of our programs since the IDL itself doesn’t yet contain that level of information. Finally, special visitors called “renderers” visit our tree to generate clients such as this JavaScript client.

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

# Going Forward

This Technology Preview is just that, and development on the new web3.js is ongoing. We are working on tooling to accompany the new library to make building web applications on Solana easier, safer, and more scalable.

Although this new approach to JavaScript tooling is drastically different than the tooling you are used to, we are confident that the customizability, performance, bundle size, and safety characteristics of the new library will make it worth the migration. We’re here to help you every step of the way, via Github issues when you find problems with the library, and on the [Solana Stack Exchange](https://sola.na/sse) when you have questions on how something is supposed to work.

## GraphQL

Though not directly related to web3.js, we wanted to hijack your attention to show you something else that we’re working on, of particular interest to frontend developers. It’s a new API for interacting with the RPC: a GraphQL API.

The `@solana/rpc-graphql` package can be used to make GraphQL queries to Solana RPC endpoints, using the same transports described above (including any customizations).

Here’s an example of retrieving account data with GraphQL:

```tsx
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

```tsx
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

```tsx
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

You can see all development of the new library and any associated tooling – such as program clients and GraphQL support – in the web3.js repository on GitHub.

https://github.com/solana-labs/solana-web3.js

Solana Labs develops these tools in public, with open source. We encourage any and all developers who would like to work on these tools to contribute to the codebase.

In fact, we welcome anyone who experiments with the new library to submit feedback via GitHub issues (or pull requests). A steady stream of feedback on the library from you will give us the confidence to propose a release candidate sooner.

You can find issues to tackle in the repository’s “issues” section, just make sure to follow the contributor guidelines!

## Thank you

We’re grateful that you have read this far. If you are interested in migrating an existing application to the new web3.js to take advantage of some of the benefits we’ve demonstrated, we want to give you some direct support. Reach out to [@steveluscher](https://t.me/steveluscher/) on Telegram to start a conversation.
