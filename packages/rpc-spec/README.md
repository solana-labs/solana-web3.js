[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc-spec/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc-spec/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc-spec/v/rc

# @solana/rpc-spec

This package contains types that describe the implementation of the JSON RPC API, as well as methods to create one. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

This API is designed to be used as follows:

```ts
const rpc =
    // Step 1 - Create an `Rpc` instance. This may be stateful.
    createSolanaRpc(mainnet('https://api.mainnet-beta.solana.com'));
const response = await rpc
    // Step 2 - Call supported methods on it to produce `PendingRpcRequest` objects.
    .getLatestBlockhash({ commitment: 'confirmed' })
    // Step 3 - Call the `send()` method on those pending requests to trigger them.
    .send({ abortSignal: AbortSignal.timeout(10_000) });
```

## Types

### `PendingRpcRequest<TResponse>`

Pending requests are the result of calling a supported method on an `Rpc` object. They encapsulate all of the information necessary to make the request without actually making it.

Calling the `send(options)` method on a `PendingRpcRequest` will trigger the request and return a promise for `TResponse`.

### `Rpc<TRpcMethods, TRpcTransport>`

An object that exposes all of the functions described by `TRpcMethods`, and fulfils them using `TRpcTransport`. Calling each method returns a `PendingRpcRequest<TResponse>` where `TResponse` is that method's response type.

### `RpcApi<TRpcMethods>`

For each of `TRpcMethods` this object exposes a method with the same name that maps between its input arguments and a `RpcPlan<TResponse>` that describes how to prepare a JSON RPC request to fetch `TResponse`.

### `RpcApiMethods`

This is a marker interface that all RPC method definitions must extend to be accepted for use with the `RpcApi` creator.

### `RpcPlan`

This type allows an `RpcApi` to describe how a particular request should be issued to the JSON RPC server. Given a function that was called on a `Rpc`, this object returns an `execute` function that dictates which request will be sent, how the underlying transport will be used and how the responses will be transformed.

This function accepts an `RpcTransport` and an `AbortSignal` and asynchronously returns an `RpcResponse`. This gives us the opportunity to:

-   define the `payload` from the requested method name and parameters before passing it to the transport.
-   call the underlying transport zero, one or multiple times depending on the use-case (e.g. caching or aggregating multiple responses).
-   transform the response from the JSON RPC server, in case it does not match the `TResponse` specified by the `PendingRpcRequest<TResponse>` returned from that function.

### `RpcSendOptions`

A configuration object consisting of the following properties:

-   `abortSignal`: An optional signal that you can supply when triggering a `PendingRpcRequest` that you might later need to abort.

### `RpcTransport`

Any function that implements this interface can act as a transport for an `Rpc`. It need only return a promise for a response given the following config:

-   `payload`: A value of arbitrary type to be sent.
-   `signal`: An optional `AbortSignal` on which the `'abort'` event will be fired if the request should be cancelled.

## Functions

### `createRpc(config)`

Creates an RPC instance given an `RpcApi<TRpcMethods>` and a `RpcTransport` capable of fulfilling them.

#### Arguments

A config object with the following properties:

-   `api`: An instance of `RpcApi`
-   `transport`: A function that implements the `RpcTransport` interface

### `createJsonRpcApi(config)`

Creates a JavaScript proxy that converts _any_ function call called on it to a `RpcPlan` by creating an `execute` function that:

-   sets the transport payload to a JSON RPC v2 payload object with the requested `methodName` and `params` properties, optionally transformed by `config.requestTransformer`.
-   transforms the transport's response using the `config.responseTransformer` function, if provided.

```ts
// For example, given this `RpcApi`:
const rpcApi = createJsonRpcApi({
    requestTransformer: (...rawParams) => rawParams.reverse(),
    responseTransformer: response => response.result,
});

// ...the following function call:
rpcApi.foo('bar', { baz: 'bat' });

// ...will produce an `RpcPlan` that:
// -   Uses the following payload: { id: 1, jsonrpc: '2.0', method: 'foo', params: ['bar', { baz: 'bat' }] }.
// -   Returns the "result" attribute of the RPC response.
```

#### Arguments

A config object with the following properties:

-   `requestTransformer<T>(request: RpcRequest<T>): RpcRequest`: An optional function that transforms the `RpcRequest` before it is sent to the JSON RPC server.
-   `responseTransformer<T>(response: RpcResponse, request: RpcRequest): RpcResponse<T>`: An optional function that transforms the `RpcResponse` before it is returned to the caller.

### `isJsonRpcPayload(payload)`

A helper function that returns `true` if the given payload is a JSON RPC v2 payload. This means, the payload is an object such that:

-   It has a `jsonrpc` property with a value of `'2.0'`.
-   It has a `method` property that is a string.
-   It has a `params` property of any type.

```ts
import { isJsonRpcPayload } from '@solana/rpc-spec';

if (isJsonRpcPayload(payload)) {
    const payloadMethod: string = payload.method;
    const payloadParams: unknown = payload.params;
}
```
