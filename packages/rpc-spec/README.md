[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc-spec/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc-spec/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc-spec/v/rc
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

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

### `RpcRequest`

An object that describes the elements of a JSON RPC request. It consists of the following properties:

-   `methodName`: The name of the JSON RPC method to be called.
-   `params`: The parameters to be passed to the JSON RPC method.

### `RpcRequestTransformer`

A function that accepts an `RpcRequest` and returns another `RpcRequest`. This allows the `RpcApi` to transform the request before it is sent to the JSON RPC server.

### `RpcResponse`

A type that represents the response from a JSON RPC server. This could be any sort of data which is why `RpcResponse` defaults to `unknown`. You may use a type parameter to specify the shape of the response — e.g. `RpcResponse<{ result: number }>`.

### `RpcResponseTransformer`

A function that accepts an `RpcResponse` and returns another `RpcResponse`. This allows the `RpcApi` to transform the response before it is returned to the caller.

### `RpcApi<TRpcMethods>`

For each of `TRpcMethods` this object exposes a method with the same name that maps between its input arguments and a `RpcApiRequestPlan<TResponse>` that describes how to prepare a JSON RPC request to fetch `TResponse`.

### `RpcApiMethods`

This is a marker interface that all RPC method definitions must extend to be accepted for use with the `RpcApi` creator.

### `RpcApiRequestPlan`

This type allows an `RpcApi` to describe how a particular request should be issued to the JSON RPC server. Given a function that was called on a `Rpc`, this object gives you the opportunity to:

-   customize the JSON RPC method name in the case that it's different than the name of that function
-   define the shape of the JSON RPC params in case they are different than the arguments provided to that function
-   provide a function to transform the JSON RPC server's response, in case it does not match the `TResponse` specified by the `PendingRpcRequest<TResponse>` returned from that function.

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

### `createRpcApi(config)`

Creates a JavaScript proxy that converts _any_ function call called on it to a `RpcApiRequestPlan` by:

-   setting `methodName` to the name of the function called, optionally transformed by `config.requestTransformer`.
-   setting `params` to the arguments supplied to that function, optionally transformed by `config.requestTransformer`.
-   setting `responseTransformer` to `config.responseTransformer`, if provided.

```ts
// For example, given this `RpcApi`:
const rpcApi = createRpcApi({
    requestTransformer: (...rawParams) => rawParams.reverse(),
    responseTransformer: response => response.result,
});

// ...the following function call:
rpcApi.foo('bar', { baz: 'bat' });

// ...will produce the following `RpcApiRequestPlan` object:
//
//     {
//         methodName: 'foo',
//         params: [{ baz: 'bat' }, 'bar'],
//         responseTransformer: (response) => response.result,
//     }
```

#### Arguments

A config object with the following properties:

-   `requestTransformer<T>(request: RpcRequest<T>): RpcRequest`: An optional function that transforms the `RpcRequest` before it is sent to the JSON RPC server.
-   `responseTransformer<T>(response: RpcResponse, request: RpcRequest): RpcResponse<T>`: An optional function that transforms the `RpcResponse` before it is returned to the caller.
