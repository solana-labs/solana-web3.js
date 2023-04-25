[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc-transport/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc-transport/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc-transport/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/rpc-transport

This package implements a JSON-RPC client with which you can interact with the Solana network. It can be used standalone, in combination with an RPC specification such as [`@solana/rpc-core`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/rpc-core), but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Configuration

A new transport created with `createJsonRpc()` can be configured as follows:

### `api` (required)

An object that conforms to `IRpcApi<TMethods>`, where `TMethods` is an interface that specifies the type of every RPC function.

```ts
interface ExampleApi {
    getBlocks(startSlot: number, endSlot: number): ReadonlyArray<number>;
}
```

#### With no concrete implementation

Crucially, this object does not _need_ to provide _implementations_ of those methods. This allows an infinite number of JSON-RPC methods to be added to the API without affecting the size of the client bundle.

Absent a concrete implementation, `@solana/rpc-transport` will simply send the function name and its arguments to the RPC as the JSON-RPC method and params. For example, if no concrete implementation for `getBlocks` is provided in `api`, the following call:

```ts
rpc.getBlocks(1, 20).send();
```

&hellip;will result in an RPC call whose `method` is `getBlocks` and whose `params` are `[1, 20]`.

#### With an optional concrete implementation

If you would like to modify the inputs to a given method call before they are sent, or would like to post-process the response from the JSON-RPC server, you may supply a concrete implementation for one or more methods of `api`.

```ts
const api = {
    getBlocks(startSlot: number, endSlot: number): ReadonlyArray<number> {
        return {
            // Optionally pre-process the method name,
            methodName: 'getBlocksInRange',
            // Pre-process the inputs any way you like.
            params: [assertIsInteger(startSlot), assertIsInteger(endSlot)],
            // Provide an optional function to modify the response.
            responseProcessor: response => ({
                confirmedBlocks: response,
                queryRange: [startSlot, endSlot],
            }),
        };
    },
};
```

### `transport` (required)

A function that implements a wire transport.

```ts
type RpcTransportConfig = Readonly<{
    payload: unknown;
    signal?: AbortSignal;
}>;

export interface IRpcTransport {
    <TResponse>(config: RpcTransportConfig): Promise<TResponse>;
}
```

An HTTP wire transport is supplied with this package, but you can supply any wire transport that conforms to `IRpcTransport`.
