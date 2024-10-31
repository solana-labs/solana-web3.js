[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc/v/rc

# @solana/rpc

This package contains utilities for creating objects that you can use to communicate with a Solana JSON RPC server. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

Unless you plan to create a custom RPC interface, you can use the [`createSolanaRpc(clusterUrl)`](#createsolanarpcclusterurl-config) function to obtain a default implementation of the [Solana JSON RPC API](https://solana.com/docs/rpc/http).

## Types

### `RpcTransport{Devnet|Testnet|Mainnet}`

These types refine the base `RpcTransport` type. Each describes a transport that is specific in some way to a particular Solana cluster.

For instance, a `RpcTransportDevnet` is understood to communicate with a RPC server related to devnet, and as such might only be accepted for use as the transport of a `RpcDevnet`.

This is useful in cases where you need to make assertions about what capabilities a RPC offers. For example, RPC methods like `requestAirdrop` are not available on mainnet. You can use the ability to assert on the type of RPC transport at compile time to prevent calling unimplemented methods or presuming the existence of unavailable capabilities.

### `RpcTransportFromClusterUrl<TClusterUrl extends ClusterUrl>`

Given a `ClusterUrl`, this utility type will resolve to as specific a `RpcTransport` as possible.

```ts
function createCustomTransport<TClusterUrl extends ClusterUrl>(
    clusterUrl: TClusterUrl,
): RpcTransportFromClusterUrl<TClusterUrl> {
    /* ... */
}
const transport = createCustomTransport(testnet('http://api.testnet.solana.com'));
transport satisfies RpcTransportTestnet; // OK
```

### `Rpc{Devnet|Testnet|Mainnet}<TRpcMethods>`

These types refine the base `Rpc` type. Each describes a RPC that is specific in some way to a particular Solana cluster and a corpus of RPC methods.

This is useful in cases where you need to make assertions about the suitability of a RPC for a given purpose. For example, you might like to make it a type error to combine certain types with RPC belonging to certain clusters, at compile time.

```ts
async function getSpecialAccountInfo(
    address: Address<'ReAL1111111111111111111111111111'>,
    rpc: RpcMainnet,
): Promise<SpecialAccountInfo>;
async function getSpecialAccountInfo(
    address: Address<'TeST1111111111111111111111111111'>,
    rpc: RpcDevnet | RpcTestnet,
): Promise<SpecialAccountInfo>;
async function getSpecialAccountInfo(address: Address, rpc: Rpc): Promise<SpecialAccountInfo> {
    /* ... */
}
const rpc = createSolanaRpc(devnet('https://api.devnet.solana.com'));
await getSpecialAccountInfo(address('ReAL1111111111111111111111111111'), rpc); // ERROR
```

### `RpcFromTransport<TRpcMethods, TRpcTransport extends RpcTransport>`

Given a `RpcTransport`, this utility type will resolve to as specific a `Rpc` as possible.

```ts
function createCustomRpc<TRpcTransport extends RpcTransport>(
    transport: TRpcTransport,
): RpcFromTransport<MyCustomRpcMethods, TRpcTransport> {
    /* ... */
}
const transport = createDefaultRpcTransport({ url: mainnet('http://rpc.company') });
transport satisfies RpcTransportMainnet; // OK
const rpc = createCustomRpc(transport);
rpc satisfies RpcMainnet<MyCustomRpcMethods>; // OK
```

### SolanaRpcApiFromTransport<TTransport extends RpcTransport>

## Constants

### `DEFAULT_RPC_CONFIG`

When you create `Rpc` instances with custom transports but otherwise the default RPC API behaviours, use this.

```ts
const myCustomRpc = createRpc({
    api: createSolanaRpcApi(DEFAULT_RPC_CONFIG),
    transport: myCustomTransport,
});
```

## Functions

### `createDefaultRpcTransport(config)`

Creates a `RpcTransport` with some default behaviours.

The default behaviours include:

-   An automatically-set `Solana-Client` request header, containing the version of `@solana/web3.js`
-   Logic that coalesces multiple calls in the same runloop, for the same methods with the same arguments, into a single network request.

#### Arguments

A config object with the following properties:

-   `dispatcher_NODE_ONLY`: An optional `Undici.Dispatcher` instance that governs how the networking stack should behave. This option is only relevant in Node applications. Consult the documentation for the various subclasses of `Undici.Dispatcher`, such as `Agent`, `Client`, and `Pool`, at https://undici.nodejs.org/#/docs/api/Client.
-   `headers`: An optional object where the keys are HTTP header names and the values are HTTP header values. This parameter is typed to disallow certain headers from being overwritten.
-   `url`: A `ClusterUrl` at which the RPC server can be contacted.

### `createSolanaRpc(clusterUrl, config)`

Creates a `Rpc` instance that exposes the Solana JSON RPC API given a cluster URL and some optional transport config. See `createDefaultRpcTransport` for the shape of the transport config.

### `createSolanaRpcFromTransport(transport)`

Creates a `Rpc` instance that exposes the Solana JSON RPC API given the supplied `RpcTransport`.
