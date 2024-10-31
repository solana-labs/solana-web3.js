[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/addresses/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/addresses/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/addresses/v/rc

# @solana/addresses

This package contains utilities for generating account addresses. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

## Types

### `Address`

This type represents a string that validates as a Solana address. Functions that require well-formed addresses should specify their inputs in terms of this type.

Whenever you need to validate an arbitrary string as a base58-encoded address, use the `address()`, `assertIsAddress()`, or `isAddress()` functions in this package.

### `ProgramDerivedAddress`

This type represents the tuple of a program derived address and the bump seed used to ensure that the address, as derived, is not found on the Ed25519 curve.

Whenever you need to validate an arbitrary tuple as one that represents a program derived address, use the `assertIsProgramDerivedAddress()` or `isProgramDerivedAddress()` functions in this package.

### `ProgramDerivedAddressBump`

This type represents an integer between 0-255 used as a seed when deriving a program derived address. The purpose of this value is to modify the derivation enough to ensure that the derived address does not find itself on the Ed25519 curve.

## Functions

### `address()`

This helper combines _asserting_ that a string is an address with _coercing_ it to the `Address` type. It's best used with untrusted input.

```ts
import { address } from '@solana/addresses';

await transfer(address(fromAddress), address(toAddress), lamports(100000n));
```

When starting from a known-good address as a string, it's more efficient to typecast it rather than to use the `address()` helper, because the helper unconditionally performs validation on its input.

```ts
import { Address } from '@solana/addresses';

const MEMO_PROGRAM_ADDRESS =
    'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr' as Address<'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'>;
```

### `assertIsAddress()`

Client applications primarily deal with addresses and public keys in the form of base58-encoded strings. Addresses returned from the RPC API conform to the type `Address`. You can use a value of that type wherever a base58-encoded address is expected.

From time to time you might acquire a string, that you expect to validate as an address, from an untrusted network API or user input. To assert that such an arbitrary string is a base58-encoded address, use the `assertIsAddress` function.

```ts
import { assertIsAddress } from '@solana/addresses';

// Imagine a function that fetches an account's balance when a user submits a form.
function handleSubmit() {
    // We know only that what the user typed conforms to the `string` type.
    const address: string = accountAddressInput.value;
    try {
        // If this type assertion function doesn't throw, then
        // Typescript will upcast `address` to `Address`.
        assertIsAddress(address);
        // At this point, `address` is an `Address` that can be used with the RPC.
        const balanceInLamports = await rpc.getBalance(address).send();
    } catch (e) {
        // `address` turned out not to be a base58-encoded address
    }
}
```

### `assertIsProgramDerivedAddress()`

In the event that you receive an address/bump-seed tuple from some untrusted source, you can assert that such a tuple conforms to the `ProgramDerivedAddress` type using this function.

See [`assertIsAddress()`](#assertisaddress) for an example of how to use an assertion function.

### `createAddressWithSeed()`

Returns a base58-encoded address derived from some base address, some program address, and a seed string or byte array.

```ts
import { createAddressWithSeed } from '@solana/addresses';

const derivedAddress = await createAddressWithSeed({
    // The private key associated with this address will be able to sign for `derivedAddress`.
    baseAddress: 'B9Lf9z5BfNPT4d5KMeaBFx8x1G4CULZYR1jA2kmxRDka' as Address,
    // Only this program will be able to write data to this account.
    programAddress: '445erYq578p2aERrGW9mn9KiYe3fuG6uHdcJ2LPPShGw' as Address,
    seed: 'data-account',
});
```

### `getAddressDecoder()`

Returns a decoder that you can use to convert an array of 32 bytes representing an address to the base58-encoded representation of that address. Returns a tuple of the `Address` and the offset within the byte array at which the decoder stopped reading.

```ts
import { getAddressDecoder } from '@solana/addresses';

const addressBytes = new Uint8Array([
    150, 183, 190, 48, 171, 8, 39, 156, 122, 213, 172, 108, 193, 95, 26, 158, 149, 243, 115, 254, 20, 200, 36, 30, 248,
    179, 178, 232, 220, 89, 53, 127,
]);
const addressDecoder = getAddressDecoder();
const address = addressDecoder.decode(address); // B9Lf9z5BfNPT4d5KMeaBFx8x1G4CULZYR1jA2kmxRDka
```

### `getAddressEncoder()`

Returns an encoder that you can use to encode a base58-encoded address to a byte array.

```ts
import { getAddressEncoder } from '@solana/addresses';

const address = 'B9Lf9z5BfNPT4d5KMeaBFx8x1G4CULZYR1jA2kmxRDka' as Address;
const addressEncoder = getAddressEncoder();
const addressBytes = addressEncoder.encode(address);
// Uint8Array(32) [
//   150, 183, 190,  48, 171,   8, 39, 156,
//   122, 213, 172, 108, 193,  95, 26, 158,
//   149, 243, 115, 254,  20, 200, 36,  30,
//   248, 179, 178, 232, 220,  89, 53, 127
// ]
```

### `getAddressFromPublicKey()`

Given a public `CryptoKey`, this method will return its associated `Address`.

```ts
import { getAddressFromPublicKey } from '@solana/addresses';

const address = await getAddressFromPublicKey(publicKey);
```

### `getProgramDerivedAddress()`

Given a program's `Address` and up to 16 `Seeds`, this method will return the program derived address (PDA) associated with each.

```ts
import { getAddressEncoder, getProgramDerivedAddress } from '@solana/addresses';

const addressEncoder = getAddressEncoder();
const { bumpSeed, pda } = await getProgramDerivedAddress({
    programAddress: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address,
    seeds: [
        // Owner
        addressEncoder.encode('9fYLFVoVqwH37C3dyPi6cpeobfbQ2jtLpN5HgAYDDdkm' as Address),
        // Token program
        addressEncoder.encode('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address),
        // Mint
        addressEncoder.encode('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' as Address),
    ],
});
```

### `isAddress()`

This is a type guard that accepts a string as input. It will both return `true` if the string conforms to the `Address` type and will refine the type for use in your program.

```ts
import { isAddress } from '@solana/addresses';

if (isAddress(ownerAddress)) {
    // At this point, `ownerAddress` has been refined to a
    // `Address` that can be used with the RPC.
    const { value: lamports } = await rpc.getBalance(ownerAddress).send();
    setBalanceLamports(lamports);
} else {
    setError(`${ownerAddress} is not an address`);
}
```

### `isProgramDerivedAddress()`

This is a type guard that accepts a tuple as input. It will both return `true` if the tuple conforms to the `ProgramDerivedAddress` type and will refine the type for use in your program.

See [`isAddress()`](#isaddress) for an example of how to use a type guard.
