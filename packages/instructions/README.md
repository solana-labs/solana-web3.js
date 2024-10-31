[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/instructions/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/instructions/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/instructions/v/rc

# @solana/instructions

This package contains types for creating transaction instructions. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Types

### `AccountRole`

The purpose for which an account participates in a transaction is described by the `AccountRole` type. Every account that participates in a transaction can be read from, but only ones that you mark as writable may be written to, and only ones that you indicate must sign the transaction will gain the privileges associated with signers at runtime.

|                               | `isSigner` | `isWritable` |
| ----------------------------- | ---------- | ------------ |
| `AccountRole.READONLY`        | &#x274c;   | &#x274c;     |
| `AccountRole.WRITABLE`        | &#x274c;   | &#x2705;     |
| `AccountRole.READONLY_SIGNER` | &#x2705;   | &#x274c;     |
| `AccountRole.WRITABLE_SIGNER` | &#x2705;   | &#x2705;     |

### `IAccountMeta<TAddress>`

This type represents an account's address and metadata about its mutability and whether it must be a signer of the transaction.

Typically, you will use one of its subtypes.

|                                   | `role`                        | `isSigner` | `isWritable` |
| --------------------------------- | ----------------------------- | ---------- | ------------ |
| `ReadonlyAccount<TAddress>`       | `AccountRole.READONLY`        | &#x274c;   | &#x274c;     |
| `WritableAccount<TAddress>`       | `AccountRole.WRITABLE`        | &#x274c;   | &#x2705;     |
| `ReadonlySignerAccount<TAddress>` | `AccountRole.READONLY_SIGNER` | &#x2705;   | &#x274c;     |
| `WritableSignerAccount<TAddress>` | `AccountRole.WRITABLE_SIGNER` | &#x2705;   | &#x2705;     |

For example, you could type the rent sysvar account like this:

```ts
type RentSysvar = ReadonlyAccount<'SysvarRent111111111111111111111111111111111'>;
```

### `IAccountLookupMeta<TAddress, TLookupTableAddress>`

This type represents a lookup of the account's address in an address lookup table. It specifies which lookup table account in which to perform the lookup, the index of the desired account address in that table, and metadata about its mutability. Notably, account addresses obtained via lookups may not act as signers.

Typically, you will use one of its subtypes.

|                                                        | `role`                 | `isSigner` | `isWritable` |
| ------------------------------------------------------ | ---------------------- | ---------- | ------------ |
| `ReadonlyLookupAccount<TAddress, TLookupTableAddress>` | `AccountRole.READONLY` | &#x274c;   | &#x274c;     |
| `WritableLookupAccount<TAddress, TLookupTableAddress>` | `AccountRole.WRITABLE` | &#x274c;   | &#x2705;     |

For example, you could type the rent sysvar account that you looked up in a lookup table like this:

```ts
type RentSysvar = ReadonlyLookupAccount<
    'SysvarRent111111111111111111111111111111111',
    'MyLookupTable111111111111111111111111111111'
>;
```

### `IInstruction<TProgramAddress>`

Use this to specify an instruction destined for a given program.

```ts
type StakeProgramInstruction = IInstruction<'StakeConfig11111111111111111111111111111111'>;
```

### `IInstructionWithAccounts<TAccounts>`

Use this type to specify an instruction that contains certain accounts.

```ts
type InstructionWithTwoAccounts = IInstructionWithAccounts<
    [
        WritableAccount, // First account
        RentSysvar, // Second account
    ]
>;
```

### `IInstructionWithData<TData>`

Use this type to specify an instruction whose data conforms to a certain type. This is most useful when you have a branded `Uint8Array` that represents a particular instruction.

For example, here is how the `AdvanceNonce` instruction is typed.

```ts
type AdvanceNonceAccountInstruction<
    TNonceAccountAddress extends string = string,
    TNonceAuthorityAddress extends string = string,
> = IInstruction<'11111111111111111111111111111111'> &
    IInstructionWithAccounts<
        [
            WritableAccount<TNonceAccountAddress>,
            ReadonlyAccount<'SysvarRecentB1ockHashes11111111111111111111'>,
            ReadonlySignerAccount<TNonceAuthorityAddress>,
        ]
    > &
    IInstructionWithData<AdvanceNonceAccountInstructionData>;
```

## Functions

### `isSignerRole(role: AccountRole)`

Returns `true` if the `AccountRole` given represents that of a signer. Also refines the TypeScript type of the supplied role.

### `isWritable(role: AccountRole)`

Returns `true` if the `AccountRole` given represents that of a writable account. Also refines the TypeScript type of the supplied role.

### `mergeRoles(roleA: AccountRole, roleB: AccountRole)`

Given two `AccountRoles`, will return the `AccountRole` that grants the highest privileges of both.

Example:

```ts
// Returns `AccountRole.WRITABLE_SIGNER`
mergeRoles(AccountRole.READONLY_SIGNER, AccountRole.WRITABLE);
```

### `downgradeRoleToNonSigner(role: AccountRole)`

Returns an `AccountRole` representing the non-signer variant of the supplied role.

### `downgradeRoleToReadonly(role: AccountRole)`

Returns an `AccountRole` representing the non-writable variant of the supplied role.

### `upgradeRoleToSigner(role: AccountRole)`

Returns an `AccountRole` representing the signer variant of the supplied role.

### `upgradeRoleToWritable(role: AccountRole)`

Returns an `AccountRole` representing the writable variant of the supplied role.
