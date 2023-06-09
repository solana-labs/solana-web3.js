[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/instructions/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/instructions/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/instructions/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/instructions

This package contains types for creating transaction instructions. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Types

### `IAccountMeta<TAddress>`

This type represents an account's address and metadata about its mutability and whether it must be a signer of the transaction.

Typically, you will use one of its subtypes.

|                                   | `isSigner` | `isWritable` |
| --------------------------------- | ---------- | ------------ |
| `ReadonlyAccount<TAddress>`       | &#x274c;   | &#x274c;     |
| `WritableAccount<TAddress>`       | &#x274c;   | &#x2705;     |
| `ReadonlySignerAccount<TAddress>` | &#x2705;   | &#x274c;     |
| `WritableSignerAccount<TAddress>` | &#x2705;   | &#x2705;     |

For example, you could type the rent sysvar account like this:

```ts
type RentSysvar = ReadonlyAccount<'SysvarRent111111111111111111111111111111111'>;
```

### `Instruction<TProgramAddress, TAccounts, TData>`

Use this to define the structure of a transaction instruction.

```ts
type InitializeStakeInstruction = Instruction<
    // Program address
    'StakeConfig11111111111111111111111111111111',
    // Accounts
    [
        WritableAccount, // Stake account
        RentSysvar
    ],
    // Data
    InitializeStakeInstructionData
>;
```

Instructions that do not require data may omit the `TData` type parameter.
