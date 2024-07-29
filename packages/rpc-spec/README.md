[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc-spec/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc-spec/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc-spec/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/rpc-spec

This package contains types that describe the implementation of the JSON RPC API, as well as methods to create one. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

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

Pending requests are the result of calling a supported method on on `Rpc` object. They encapsulate all of the information necessary to make the request without actually making it.

Calling the `send(options)` method on a `PendingRpcRequest` will trigger the request and return a promise for `TResponse`.

### `Rpc<TRpcMethods, TRpcTransport>`

An object that exposes all of the functions described by `TRpcMethods`, and fulfils them using `TRpcTransport`. Calling each method returns a `PendingRpcRequest<TResponse>` where `TResponse` is that method's response type.

### `RpcApi<TRpcMethods>`

For each of `TRpcMethods` this object exposes a method with the same name that maps between its input arguments and a `RpcRequest<TResponse>` that describes how to prepare a JSON RPC request to fetch `TResponse`.

### `RpcApiMethods`

This is a marker interface that all RPC method definitions must extend to be accepted for use with the `RpcApi` creator.

### `RpcRequest`

This type describes how a particular request should be issued to the JSON RPC server. Given a function that was called on a `Rpc`, this object gives you the opportunity to:

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

Creates a JavaScript proxy that converts _any_ function call called on it to a `RpcRequest` by:

-   setting `methodName` to the name of the function called
-   setting `params` to the arguments supplied to that function, optionally transformed by `config.parametersTransformer`
-   setting `responseTransformer` to `config.responseTransformer` or the identity function if no such config exists

```ts
// For example, given this `RpcApi`:
const rpcApi = createRpcApi({
    paramsTransformer: (...rawParams) => rawParams.reverse(),
    responseTransformer: response => response.result,
});

// ...the following function call:
rpcApi.foo('bar', { baz: 'bat' });

// ...will produce the following `RpcRequest` object:
//
//     {
//         methodName: 'foo',
//         params: [{ baz: 'bat' }, 'bar'],
//         responseTransformer: (response) => response.result,
//     }
```

#### Arguments

A config object with the following properties:

-   `parametersTransformer<T>(params: T, methodName): unknown`: An optional function that maps between the shape of the arguments an RPC method was called with and the shape of the params expected by the JSON RPC server.
-   `responseTransformer<T>(response, methodName): T`: An optional function that maps between the shape of the JSON RPC server response for a given method and the shape of the response expected by the `RpcApi`.
