[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/rpc-types/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/rpc-types/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/rpc-types/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/rpc-types

This package defines types for values used in the [Solana JSON-RPC](https://docs.solana.com/api/http) and a series of helpers for working with them. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Types

### `Commitment`

A type that enumerates the possible commitment statuses &ndash; each a measure of the network confirmation and stake levels on a particular block. Read more about the statuses themselves, [here](https://docs.solana.com/cluster/commitments).

### `LamportsUnsafeBeyond2Pow53Minus1`

This type represents an integer value denominated in Lamports (ie. $1 \times 10^{-9}$ &#x25CE;).

**Note**: Despite the fact that this type is represented as a `bigint` in client code and a `u64` in server code, the JSON-RPC implementation represents Lamports as an IEEE 754 floating point number. This means that you can only safely send or receive values up to $2^{53} - 1$ between the client and the RPC server. See https://github.com/solana-labs/solana/issues/30741 for more detail.

### `StringifiedBigInt`

This type represents a `bigint` which has been encoded as a string for transit over a transport that does not support `bigint` values natively. The JSON-RPC is such a transport.

### `StringifiedNumber`

This type represents a number which has been encoded as a string for transit over a transport where loss of precision when using the native number type is a concern. The JSON-RPC is such a transport.

### `UnixTimestamp`

This type represents a number in the range $[-8.64 \times 10^{15}, 8.64 \times 10^{15}]$. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date

## Functions

### `assertIsLamports()`

Lamport values returned from the RPC API conform to the type `LamportsUnsafeBeyond2Pow53Minus1`. You can use a value of that type wherever a quantity of Lamports is expected.

From time to time you might acquire a number that you expect to be a quantity of Lamports, from an untrusted network API or user input. To assert that such an arbitrary number is usable as a quantity of Lamports, use the `assertIsLamports` function.

```ts
import { assertIsLamports } from '@solana/rpc-types';

// Imagine a function that creates a transfer instruction when a user submits a form.
function handleSubmit() {
    // We know only that what the user typed conforms to the `number` type.
    const lamports: number = parseInt(quantityInput.value, 10);
    try {
        // If this type assertion function doesn't throw, then
        // Typescript will upcast `lamports` to `LamportsUnsafeBeyond2Pow53Minus1`.
        assertIsLamports(lamports);
        // At this point, `lamports` is a `LamportsUnsafeBeyond2Pow53Minus1` that can be used anywhere Lamports are expected.
        await transfer(fromAddress, toAddress, lamports);
    } catch (e) {
        // `lamports` turned out not to validate as a quantity of Lamports.
    }
}
```

### `assertIsStringifiedBigInt()`

Large integers returned from the RPC API encoded as strings conform to the type `StringifiedBigInt`.

From time to time you might acquire a string that you suspect might validate as a `StringifiedBigInt`, from an untrusted network API or user input. To assert that such an arbitrary string is usable as a `StringifiedBigInt`, use the `assertIsStringifiedBigInt` function.

See [`assertIsLamports()`](#assertislamports) for an example of how to use an assertion function.

### `assertIsStringifiedNumber()`

Large numbers returned from the RPC API encoded as strings conform to the type `StringifiedNumber`.

From time to time you might acquire a string that you suspect might validate as a `StringifiedNumber`, from an untrusted network API or user input. To assert that such an arbitrary string is usable as a `StringifiedNumber`, use the `assertIsStringifiedNumber` function.

See [`assertIsLamports()`](#assertislamports) for an example of how to use an assertion function.

### `assertIsUnixTimestamp()`

Timestamps returned from the RPC API conform to the type `UnixTimestamp`.

From time to time you might acquire a number that you suspect might validate as a `UnixTimestamp`, from an untrusted network API or user input. To assert that such an arbitrary number is usable as a `UnixTimestamp`, use the `assertIsUnixTimestamp` function.

See [`assertIsLamports()`](#assertislamports) for an example of how to use an assertion function.

### `commitmentComparator()`

A function that accepts two `Commitments` as input, and returns `-1` if the first is lower than the second, `0` if they are the same, and `1` if the second is higher than the first. You can use this comparator to sort items by commitment, or to determine an upper/lower bound on a level of commitment given two options.

```ts
import { commitmentComparator } from '@solana/rpc-types';

transactions.sort((a, b) => commitmentComparator(a.confirmationStatus, b.confirmationStatus));
```

### `isLamports()`

This is a type guard that accepts a `bigint` as input. It will both return `true` if the integer conforms to the `LamportsUnsafeBeyond2Pow53Minus1` type and will refine the type for use in your program.

```ts
import { isLamports } from '@solana/rpc-types';

if (isLamports(lamports)) {
    // At this point, `lamports` has been refined to a
    // `LamportsUnsafeBeyond2Pow53Minus1` that can be used anywhere Lamports are expected.
    await transfer(fromAddress, toAddress, lamports);
} else {
    setError(`${ownerAddress} is not an address`);
}
```

### `isStringifiedBigInt()`

This is a type guard that accepts a string as input. It will both return `true` if the string can be parsed as a `bigint` and will refine the type for use in your program.

See [`isLamports()`](#islamports) for an example of how to use a type guard.

### `isStringifiedNumber()`

This is a type guard that accepts a string as input. It will both return `true` if the string can be parsed as a JavaScript `Number` and will refine the type for use in your program.

See [`isLamports()`](#islamports) for an example of how to use a type guard.

### `isUnixTimestamp()`

This is a type guard that accepts a number as input. It will both return `true` if the number is in the Unix timestamp range and will refine the type for use in your program.

See [`isLamports()`](#islamports) for an example of how to use a type guard.

### `lamports()`

This helper combines _asserting_ that a number is a possible number of Lamports with _coercing_ it to the `LamportsUnsafeBeyond2Pow53Minus1` type. It's best used with untrusted input.

```ts
import { lamports } from '@solana/rpc-types';

await transfer(address(fromAddress), address(toAddress), lamports(100000n));
```

### `stringifiedBigInt()`

This helper combines _asserting_ that a string represents a `bigint` with _coercing_ it to the `StringifiedBigInt` type. It's best used with untrusted input.

### `stringifiedNumber()`

This helper combines _asserting_ that a string parses as a JavaScript `Number` with _coercing_ it to the `StringifiedNumber` type. It's best used with untrusted input.

### `unixTimestamp()`

This helper combines _asserting_ that a number is in the Unix timestamp range with _coercing_ it to the `UnixTimestamp` type. It's best used with untrusted input.
