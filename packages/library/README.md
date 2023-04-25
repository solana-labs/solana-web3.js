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

# Experimental Solana JavaScript SDK

Use this to interact with accounts and programs on the Solana network through the Solana [JSON-RPC API](https://docs.solana.com/apps/jsonrpc-api).

**This library is experimental**. It is unsuitable for production use, because the API is unstable and may change without warning. If you want to build a production Solana application, use the [1.x branch](https://www.npmjs.com/package/@solana/web3.js).

## Installation

### For use in Node.js, React Native, or a web application

```shell
npm install --save @solana/web3.js@experimental
```

### For use in a browser, without a build system

```html
<!-- Development (debug mode, unminified) -->
<script src="https://unpkg.com/@solana/web3.js@experimental/dist/index.development.js"></script>

<!-- Production (minified) -->
<script src="https://unpkg.com/@solana/web3.js@experimental/dist/index.production.min.js"></script>
```

## Usage

There are 3 main applications of this library.

1. **RPC**. Solana apps interact with the network by calling methods on the Solana JSON-RPC.
2. **Transactions**. Solana apps interact with Solana program by building and sending transactions.
3. **Keys**. People use cryptographic keys to verify the provenance of messages and to attest to the ownership of their accounts.

### RPC

First, configure your connection to an RPC server. This might be a server that you host, one that you lease, or one of the limited-use [public RPC servers](https://docs.solana.com/cluster/rpc-endpoints).

```ts
import { createDefaultRpcTransport } from '@solana/web3.js';
const devnetTransport = createDefaultRpcTransport({ url: 'https://api.devnet.solana.com' });
```

Second, construct an RPC instance that uses that transport.

```ts
const devnetRpc = createSolanaRpc({ transport: devnetTransport });
```

Now, you can use it to call methods on your RPC server. For instance, here is how you would fetch an account's balance.

```ts
const systemProgramAddress = '11111111111111111111111111111111' as Base58EncodedAddress;
const balanceInLamports = await devnetRpc.getBalance(systemProgramAddress).send();
console.log('Balance of System Program account in Lamports', balanceInLamports);
```

### Transactions

Unimplemented.

### Keys

#### Addresses and public keys

Client applications primarily deal with addresses and public keys in the form of base58-encoded strings. Addresses and public keys returned from the RPC API conform to the type `Base58EncodedAddress`. You can use a value of that type wherever a base58-encoded address or key is expected.

From time to time you might acquire a string, that you expect to validate as an address, from an untrusted network API or user input. To assert that such an arbitrary string is a base58-encoded address, use the `assertIsBase58EncodedAddress` function.

```ts
import { assertIsBase58EncodedAddress } from '@solana/web3.js`;

// Imagine a function that fetches an account's balance when a user submits a form.
function handleSubmit() {
    // We know only that what the user typed conforms to the `string` type.
    const address: string = accountAddressInput.value;
    try {
        // If this type assertion function doesn't throw, then
        // Typescript will upcast `address` to `Base58EncodedAddress`.
        assertIsBase58EncodedAddress(address);
        // At this point, `address` is a `Base58EncodedAddress` that can be used with the RPC.
        const balanceInLamports = await rpc.getBalance(address).send();
    } catch (e) {
        // `address` turned out not to be a base58-encoded address
    }
}
```
