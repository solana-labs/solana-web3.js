[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/programs/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/programs/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/programs/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/programs

This package contains helpers for identifying custom program errors. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Functions

### `isProgramError()`

This function takes any error — typically caused by a transaction failure — and identifies whether it is a custom program error from the provided program address. It takes the following parameters:

-   The `error` to identify.
-   The `transactionMessage` object that failed to execute. Since the RPC response only provide the index of the failed instruction, we need the transaction message to access its program address.
-   The `programAddress` of the program from which the error is expected.
-   Optionally, the expected error `code` of the custom program error. When provided, the function will also check that the custom program error code matches the given value.

```ts
try {
    // Send and confirm your transaction.
} catch (error) {
    if (isProgramError(error, transactionMessage, myProgramAddress, 42)) {
        // Handle custom program error 42 from this program.
    } else if (isProgramError(error, transactionMessage, myProgramAddress)) {
        // Handle all other custom program errors from this program.
    } else {
        throw error;
    }
}
```
