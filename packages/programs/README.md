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

This package contains types for defining programs and helpers for resolving program errors. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Types

### `Program`

The `Program` type defines a Solana program.

```ts
const myProgram: Program<'1234..5678'> = {
    name: 'myProgramName',
    address: '1234..5678' as Address<'1234..5678'>,
};
```

### `ProgramWithErrors`

The `ProgramWithErrors` type helps extend the `Program` type by defining a `getErrorFromCode` function that can be used to resolve a custom program error from a transaction error code.

```ts
enum MyProgramErrorCode {
    UNINITIALIZED_ACCOUNT = 0,
    INVALID_ACCOUNT_OWNER = 1,
    INVALID_ACCOUNT_DATA = 2,
    SOME_OTHER_ERROR = 3,
}

class MyProgramError extends Error {
    // ...
}

const myProgram: Program<'1234..5678'> & ProgramWithErrors<MyProgramErrorCode, MyProgramError> = {
    name: 'myProgramName',
    address: '1234..5678' as Address<'1234..5678'>,
    getErrorFromCode: (code: MyProgramErrorCode, originalError: Error): MyProgramError => {
        // ...
    },
};
```

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

### `resolveTransactionError()`

This function takes a raw error caused by a transaction failure and attempts to resolve it into a custom program error.

For this to work, the `resolveTransactionError` function also needs the following parameters:

-   The `transaction` object that failed to execute. This allows us to identify the failing instruction and correctly identify the program that caused the error.
-   An array of all `programs` that can be used to resolve the error. If the program that caused the error is not present in the array, the function won't be able to return a custom program error.

Note that, if the error cannot be resolved into a custom program error, the original error is returned as-is.

```ts
// Store your programs.
const programs = [createSplSystemProgram(), createSplComputeBudgetProgram(), createSplAddressLookupTableProgram()];

try {
    // Send and confirm your transaction.
} catch (error) {
    throw resolveTransactionError(error, transaction, programs);
}
```
