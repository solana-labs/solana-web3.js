[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc-transformers/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc-transformers/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc-transformers/v/rc
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/rpc-transformers

## Request Transformers

### `getDefaultRequestTransformerForSolanaRpc(config)`

Returns the default request transformer for the Solana RPC API. Under the hood, this function composes multiple `RpcRequestTransformer` together such as the `getDefaultCommitmentTransformer`, the `getIntegerOverflowRequestTransformer` and the `getBigIntDowncastRequestTransformer`.

```ts
import { getDefaultRequestTransformerForSolanaRpc } from '@solana/rpc-transformers';

const requestTransformer = getDefaultRequestTransformerForSolanaRpc({
    defaultCommitment: 'confirmed',
    onIntegerOverflow: (request, keyPath, value) => {
        throw new Error(`Integer overflow at ${keyPath.join('.')}: ${value}`);
    },
});
```

### `getDefaultCommitmentTransformer(config)`

Creates a transformer that adds the provided default commitment to the configuration object of the request when applicable.

```ts
import { getDefaultCommitmentTransformer, OPTIONS_OBJECT_POSITION_BY_METHOD } from '@solana/rpc-transformers';

const requestTransformer = getDefaultCommitmentTransformer({
    defaultCommitment: 'confirmed',
    optionsObjectPositionByMethod: OPTIONS_OBJECT_POSITION_BY_METHOD,
});
```

### `getIntegerOverflowRequestTransformer(handler)`

Creates a transformer that traverses the request parameters and executes the provided handler when an integer overflow is detected.

```ts
import { getIntegerOverflowRequestTransformer } from '@solana/rpc-transformers';

const requestTransformer = getIntegerOverflowRequestTransformer((request, keyPath, value) => {
    throw new Error(`Integer overflow at ${keyPath.join('.')}: ${value}`);
});
```

### `getBigIntDowncastRequestTransformer()`

Creates a transformer that downcasts all `BigInt` values to `Number`.

```ts
import { getBigIntDowncastRequestTransformer } from '@solana/rpc-transformers';

const requestTransformer = getBigIntDowncastRequestTransformer();
```

### `getTreeWalkerRequestTransformer(visitors, initialState)`

Creates a transformer that traverses the request parameters and executes the provided visitors at each node. A custom initial state can be provided but must at least provide `{ keyPath: [] }`.

```ts
import { getTreeWalkerRequestTransformer } from '@solana/rpc-transformers';

const requestTransformer = getTreeWalkerRequestTransformer(
    [
        // Replaces foo.bar with "baz".
        (node, state) => (state.keyPath === ['foo', 'bar'] ? 'baz' : node),
        // Increments all numbers by 1.
        node => (typeof node === number ? node + 1 : node),
    ],
    { keyPath: [] },
);
```
