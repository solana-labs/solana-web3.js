# @solana/codecs-data-structures

## 2.0.0-rc.2

### Patch Changes

-   [#3137](https://github.com/solana-labs/solana-web3.js/pull/3137) [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a) Thanks [@mcintyre94](https://github.com/mcintyre94)! - Add edge-light to package exports

-   Updated dependencies [[`38faba0`](https://github.com/solana-labs/solana-web3.js/commit/38faba05fab479ddbd95d0e211744d203f8aa823), [`fd72c2e`](https://github.com/solana-labs/solana-web3.js/commit/fd72c2ed1edad488318fa5d3e285f04852f4210a)]:
    -   @solana/errors@2.0.0-rc.2
    -   @solana/codecs-numbers@2.0.0-rc.2
    -   @solana/codecs-core@2.0.0-rc.2

## 2.0.0-rc.1

### Patch Changes

-   Updated dependencies []:
    -   @solana/codecs-core@2.0.0-rc.1
    -   @solana/codecs-numbers@2.0.0-rc.1
    -   @solana/errors@2.0.0-rc.1

## 2.0.0-rc.0

### Patch Changes

-   Updated dependencies [[`677a9c4`](https://github.com/solana-labs/solana-web3.js/commit/677a9c4eb88a8ac6a9ede8d82f367c5ac8d69ff4)]:
    -   @solana/errors@2.0.0-rc.0
    -   @solana/codecs-core@2.0.0-rc.0
    -   @solana/codecs-numbers@2.0.0-rc.0

## 2.0.0-preview.4

### Patch Changes

-   [#2715](https://github.com/solana-labs/solana-web3.js/pull/2715) [`26dae19`](https://github.com/solana-labs/solana-web3.js/commit/26dae190c2ec835fbdaa7b7d66ca33d6ba0727b8) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Consolidated `getNullableCodec` and `getOptionCodec` with their `Zeroable` counterparts and added more configurations

    Namely, the `prefix` option can now be set to `null` and the `fixed` option was replaced with the `noneValue` option which can be set to `"zeroes"` for `Zeroable` codecs or a custom byte array for custom representations of none values. This means the `getZeroableNullableCodec` and `getZeroableOptionCodec` functions were removed in favor of the new options.

    ```ts
    // Before.
    getZeroableNullableCodec(getU16Codec());

    // After.
    getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: null });
    ```

    Additionally, it is now possible to create nullable codecs that have no `prefix` nor `noneValue`. In this case, the existence of the nullable item is indicated by the presence of any remaining bytes left to decode.

    ```ts
    const codec = getNullableCodec(getU16Codec(), { prefix: null });
    codec.encode(42); // 0x2a00
    codec.encode(null); // Encodes nothing.
    codec.decode(new Uint8Array([42, 0])); // 42
    codec.decode(new Uint8Array([])); // null
    ```

    Also note that it is now possible for custom `noneValue` byte arrays to be of any length — previously, it had to match the fixed-size of the nullable item.

    Here is a recap of all supported scenarios, using a `u16` codec as an example:

    | `encode(42)` / `encode(null)` | No `noneValue` (default) | `noneValue: "zeroes"`       | Custom `noneValue` (`0xff`) |
    | ----------------------------- | ------------------------ | --------------------------- | --------------------------- |
    | `u8` prefix (default)         | `0x012a00` / `0x00`      | `0x012a00` / `0x000000`     | `0x012a00` / `0x00ff`       |
    | Custom `prefix` (`u16`)       | `0x01002a00` / `0x0000`  | `0x01002a00` / `0x00000000` | `0x01002a00` / `0x0000ff`   |
    | No `prefix`                   | `0x2a00` / `0x`          | `0x2a00` / `0x0000`         | `0x2a00` / `0xff`           |

    Reciprocal changes were made with `getOptionCodec`.

-   [#2606](https://github.com/solana-labs/solana-web3.js/pull/2606) [`367b8ad`](https://github.com/solana-labs/solana-web3.js/commit/367b8ad0cce55a916abfb0125f36b6e844333b2b) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Use commonjs package type

-   Updated dependencies [[`4f19842`](https://github.com/solana-labs/solana-web3.js/commit/4f198423997d28d927f982333d268e19940656df), [`be36bab`](https://github.com/solana-labs/solana-web3.js/commit/be36babd752b1c987a2f53b4ff83ac8c045a3418), [`367b8ad`](https://github.com/solana-labs/solana-web3.js/commit/367b8ad0cce55a916abfb0125f36b6e844333b2b)]:
    -   @solana/errors@2.0.0-preview.4
    -   @solana/codecs-numbers@2.0.0-preview.4
    -   @solana/codecs-core@2.0.0-preview.4

## 2.0.0-preview.3

### Patch Changes

-   [#2434](https://github.com/solana-labs/solana-web3.js/pull/2434) [`31916ae`](https://github.com/solana-labs/solana-web3.js/commit/31916ae5d4fb29f239c63252a59745e33a6979ea) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Renamed `mapCodec` to `transformCodec`

-   [#2397](https://github.com/solana-labs/solana-web3.js/pull/2397) [`a548de2`](https://github.com/solana-labs/solana-web3.js/commit/a548de2ebe3cf7289fd126933c4c395c885c3224) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Added a new `addCodecSizePrefix` primitive

    ```ts
    const codec = addCodecSizePrefix(getBase58Codec(), getU32Codec());

    codec.encode('hello world');
    // 0x0b00000068656c6c6f20776f726c64
    //   |       └-- Our encoded base-58 string.
    //   └-- Our encoded u32 size prefix.
    ```

-   [#2344](https://github.com/solana-labs/solana-web3.js/pull/2344) [`deb7b80`](https://github.com/solana-labs/solana-web3.js/commit/deb7b806b4cbe620b1714be1765c981d88c3a2f6) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Improve `getTupleCodec` type inferences and performance

    The tuple codec now infers its encoded/decoded type from the provided codec array and uses the new `DrainOuterGeneric` helper to reduce the number of TypeScript instantiations.

-   [#2322](https://github.com/solana-labs/solana-web3.js/pull/2322) [`6dcf548`](https://github.com/solana-labs/solana-web3.js/commit/6dcf5483bb6bbb8d343db28dedb258c8da91ffac) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Use `DrainOuterGeneric` helper on codec type mappings

    This significantly reduces the number of TypeScript instantiations on object mappings,
    which increases TypeScript performance and prevents "Type instantiation is excessively deep and possibly infinite" errors.

-   [#2400](https://github.com/solana-labs/solana-web3.js/pull/2400) [`ebb03cd`](https://github.com/solana-labs/solana-web3.js/commit/ebb03cd8270027db957d4cecc7d2374d468d4ccb) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Added new `containsBytes` and `getConstantCodec` helpers

    The `containsBytes` helper checks if a `Uint8Array` contains another `Uint8Array` at a given offset.

    ```ts
    containsBytes(new Uint8Array([1, 2, 3, 4]), new Uint8Array([2, 3]), 1); // true
    containsBytes(new Uint8Array([1, 2, 3, 4]), new Uint8Array([2, 3]), 2); // false
    ```

    The `getConstantCodec` function accepts any `Uint8Array` and returns a `Codec<void>`. When encoding, it will set the provided `Uint8Array` as-is. When decoding, it will assert that the next bytes contain the provided `Uint8Array` and move the offset forward.

    ```ts
    const codec = getConstantCodec(new Uint8Array([1, 2, 3]));

    codec.encode(undefined); // 0x010203
    codec.decode(new Uint8Array([1, 2, 3])); // undefined
    codec.decode(new Uint8Array([1, 2, 4])); // Throws an error.
    ```

-   [#2381](https://github.com/solana-labs/solana-web3.js/pull/2381) [`49a764c`](https://github.com/solana-labs/solana-web3.js/commit/49a764c6d481886501540f8dbfe8be75d754355b) Thanks [@lorisleiva](https://github.com/lorisleiva)! - DataEnum codecs can now use numbers or symbols as discriminator values

    ```ts
    const codec = getDataEnumCodec([[1, getStructCodec([[['one', u32]]])][(2, getStructCodec([[['two', u32]]]))]]);

    codec.encode({ __kind: 1, one: 42 });
    codec.encode({ __kind: 2, two: 42 });
    ```

    This means you can also use enum values as discriminators, like so:

    ```ts
    enum Event {
        Click,
        KeyPress,
    }
    const codec = getDataEnumCodec([
        [
            Event.Click,
            getStructCodec([
                [
                    ['x', u32],
                    ['y', u32],
                ],
            ]),
        ],
        [Event.KeyPress, getStructCodec([[['key', u32]]])],
    ]);

    codec.encode({ __kind: Event.Click, x: 1, y: 2 });
    codec.encode({ __kind: Event.KeyPress, key: 3 });
    ```

-   [#2413](https://github.com/solana-labs/solana-web3.js/pull/2413) [`002cc38`](https://github.com/solana-labs/solana-web3.js/commit/002cc38a99cd4c91c7ce9023e1b4fb28f7e10832) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Removed `getStringCodec` in favour of `fixCodecSize` and `addCodecSizePrefix`

    The `getStringCodec` function now always returns a `VariableSizeCodec` that uses as many bytes as necessary to encode and/or decode strings. In order to fix or prefix the size of a `getStringCodec`, you may now use the `fixCodecSize` or `prefixCodecSide` accordingly. Here are some examples:

    ```ts
    // Before.
    getStringCodec({ size: 'variable' }); // Variable.
    getStringCodec({ encoding: getUtf8Codec(), size: 'variable' }); // Variable (equivalent).
    getStringCodec({ size: 5 }); // Fixed.
    getStringCodec({ encoding: getUtf8Codec(), size: 5 }); // Fixed (equivalent).
    getStringCodec(); // Prefixed.
    getStringCodec({ encoding: getUtf8Codec(), size: getU32Codec() }); // Prefixed (equivalent).

    // After.
    getUtf8Codec(); // Variable.
    fixCodecSize(getUtf8Codec(), 5); // Fixed.
    addCodecSizePrefix(getUtf8Codec(), getU32Codec()); // Prefixed.
    ```

-   [#2383](https://github.com/solana-labs/solana-web3.js/pull/2383) [`ce1be3f`](https://github.com/solana-labs/solana-web3.js/commit/ce1be3fe37ea9b744fd836f3d6c2c8e5e31efd77) Thanks [@lorisleiva](https://github.com/lorisleiva)! - `getScalarEnumCodec` is now called `getEnumCodec`

-   [#2430](https://github.com/solana-labs/solana-web3.js/pull/2430) [`82cf07f`](https://github.com/solana-labs/solana-web3.js/commit/82cf07f4e905f6b056e70a0463a94222c3e7cadd) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Added `useValuesAsDiscriminators` option to `getEnumCodec`

    When dealing with numerical enums that have explicit values, you may now use the `useValuesAsDiscriminators` option to encode the value of the enum variant instead of its index.

    ```ts
    enum Numbers {
        One,
        Five = 5,
        Six,
        Nine = 9,
    }

    const codec = getEnumCodec(Numbers, { useValuesAsDiscriminators: true });
    codec.encode(Direction.One); // 0x00
    codec.encode(Direction.Five); // 0x05
    codec.encode(Direction.Six); // 0x06
    codec.encode(Direction.Nine); // 0x09
    ```

    Note that when using the `useValuesAsDiscriminators` option on an enum that contains a lexical value, an error will be thrown.

    ```ts
    enum Lexical {
        One,
        Two = 'two',
    }
    getEnumCodec(Lexical, { useValuesAsDiscriminators: true }); // Throws an error.
    ```

-   [#2398](https://github.com/solana-labs/solana-web3.js/pull/2398) [`bef9604`](https://github.com/solana-labs/solana-web3.js/commit/bef960435eb2303395bfa76e44f84d3348c5722d) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Added a new `getUnionCodec` helper that can be used to encode/decode any TypeScript union.

    ```ts
    const codec: Codec<number | boolean> = getUnionCodec(
        [getU16Codec(), getBooleanCodec()],
        value => (typeof value === 'number' ? 0 : 1),
        (bytes, offset) => (bytes.slice(offset).length > 1 ? 0 : 1),
    );

    codec.encode(42); // 0x2a00
    codec.encode(true); // 0x01
    ```

-   [#2382](https://github.com/solana-labs/solana-web3.js/pull/2382) [`7e86583`](https://github.com/solana-labs/solana-web3.js/commit/7e86583da68695076ec62033f3fe078b3890f026) Thanks [@lorisleiva](https://github.com/lorisleiva)! - `getDataEnumCodec` is now called `getDiscriminatedUnionCodec`

-   [#2401](https://github.com/solana-labs/solana-web3.js/pull/2401) [`919c736`](https://github.com/solana-labs/solana-web3.js/commit/919c7367dec8e142746295128cc6c2cc6752e636) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Added new `getHiddenPrefixCodec` and `getHiddenSuffixCodec` helpers

    These functions allow us to respectively prepend or append a list of hidden `Codec<void>` to a given codec. When encoding, the hidden codecs will be encoded before or after the main codec and the offset will be moved accordingly. When decoding, the hidden codecs will be decoded but only the result of the main codec will be returned. This is particularly helpful when creating data structures that include constant values that should not be included in the final type.

    ```ts
    const codec: Codec<number> = getHiddenPrefixCodec(getU16Codec(), [
        getConstantCodec(new Uint8Array([1, 2, 3])),
        getConstantCodec(new Uint8Array([4, 5, 6])),
    ]);

    codec.encode(42);
    // 0x0102030405062a00
    //   |     |     └-- Our main u16 codec (value = 42).
    //   |     └-- Our second hidden prefix codec.
    //   └-- Our first hidden prefix codec.

    codec.decode(new Uint8Array([1, 2, 3, 4, 5, 6, 42, 0])); // 42
    ```

-   [#2411](https://github.com/solana-labs/solana-web3.js/pull/2411) [`2e5af9f`](https://github.com/solana-labs/solana-web3.js/commit/2e5af9f1a9410f15108863342b48225fdf9a0c83) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Renamed `fixCodec` to `fixCodecSize`

-   [#2433](https://github.com/solana-labs/solana-web3.js/pull/2433) [`2d48c09`](https://github.com/solana-labs/solana-web3.js/commit/2d48c0954a3823b937a9b4e572a8d63cd7e4631c) Thanks [@lorisleiva](https://github.com/lorisleiva)! - The `getBooleanCodec` function now accepts variable-size number codecs

-   [#2412](https://github.com/solana-labs/solana-web3.js/pull/2412) [`e3e82d9`](https://github.com/solana-labs/solana-web3.js/commit/e3e82d909825e958ae234ed18500335a621773bd) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Removed the size option of `getBytesCodec`

    The `getBytesCodec` function now always returns a `VariableSizeCodec` that uses as many bytes as necessary to encode and/or decode byte arrays. In order to fix or prefix the size of a `getBytesCodec`, you may now use the `fixCodecSize` or `prefixCodecSide` accordingly. Here are some examples:

    ```ts
    // Before.
    getBytesCodec(); // Variable.
    getBytesCodec({ size: 5 }); // Fixed.
    getBytesCodec({ size: getU16Codec() }); // Prefixed.

    // After.
    getBytesCodec(); // Variable.
    fixCodecSize(getBytesCodec(), 5); // Fixed.
    addCodecSizePrefix(getBytesCodec(), getU16Codec()); // Prefixed.
    ```

-   [#2394](https://github.com/solana-labs/solana-web3.js/pull/2394) [`288029a`](https://github.com/solana-labs/solana-web3.js/commit/288029a55a5eeb863b6df960027a59214ffc37f1) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Added a new `getLiteralUnionCodec`

    ```ts
    const codec = getLiteralUnionCodec(['left', 'right', 'up', 'down']);
    // ^? FixedSizeCodec<"left" | "right" | "up" | "down">

    const bytes = codec.encode('left'); // 0x00
    const value = codec.decode(bytes); // 'left'
    ```

-   [#2410](https://github.com/solana-labs/solana-web3.js/pull/2410) [`4ae78f5`](https://github.com/solana-labs/solana-web3.js/commit/4ae78f5cdddd6772b25351beb813483d4e52cea6) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Added new `getZeroableNullableCodec` and `getZeroableOptionCodec` functions

    These functions rely on a zero value to represent `None` or `null` values as opposed to using a boolean prefix.

    ```ts
    const codec = getZeroableNullableCodec(getU16Codec());
    codec.encode(42); // 0x2a00
    codec.encode(null); // 0x0000
    codec.decode(new Uint8Array([42, 0])); // 42
    codec.encode(new Uint8Array([0, 0])); // null
    ```

    Both functions can also be provided with a custom definition of the zero value using the `zeroValue` option.

    ```ts
    const codec = getZeroableNullableCodec(getU16Codec(), {
        zeroValue: new Uint8Array([255, 255]),
    });
    codec.encode(42); // 0x2a00
    codec.encode(null); // 0xfffff
    codec.encode(new Uint8Array([0, 0])); // 0
    codec.decode(new Uint8Array([42, 0])); // 42
    codec.decode(new Uint8Array([255, 255])); // null
    ```

-   [#2380](https://github.com/solana-labs/solana-web3.js/pull/2380) [`bf029dd`](https://github.com/solana-labs/solana-web3.js/commit/bf029dd90230405b3d59f70aedd57fc0117b926e) Thanks [@lorisleiva](https://github.com/lorisleiva)! - DataEnum codecs now support custom discriminator properties

    ```ts
    const codec = getDataEnumCodec(
        [
            [
                'click',
                getStructCodec([
                    [
                        ['x', u32],
                        ['y', u32],
                    ],
                ]),
            ],
            ['keyPress', getStructCodec([[['key', u32]]])],
        ],
        { discriminator: 'event' },
    );

    codec.encode({ event: 'click', x: 1, y: 2 });
    codec.encode({ event: 'keyPress', key: 3 });
    ```

-   Updated dependencies [[`9370133`](https://github.com/solana-labs/solana-web3.js/commit/9370133e414bfa863517248d97905449e9a867eb), [`31916ae`](https://github.com/solana-labs/solana-web3.js/commit/31916ae5d4fb29f239c63252a59745e33a6979ea), [`a548de2`](https://github.com/solana-labs/solana-web3.js/commit/a548de2ebe3cf7289fd126933c4c395c885c3224), [`ff4aff6`](https://github.com/solana-labs/solana-web3.js/commit/ff4aff61c05c0ae5bfb62d35353d9527588b39b6), [`89f399d`](https://github.com/solana-labs/solana-web3.js/commit/89f399d474abac463b1daaa864c88305d7b8c21f), [`ebb03cd`](https://github.com/solana-labs/solana-web3.js/commit/ebb03cd8270027db957d4cecc7d2374d468d4ccb), [`ce1be3f`](https://github.com/solana-labs/solana-web3.js/commit/ce1be3fe37ea9b744fd836f3d6c2c8e5e31efd77), [`82cf07f`](https://github.com/solana-labs/solana-web3.js/commit/82cf07f4e905f6b056e70a0463a94222c3e7cadd), [`2d54650`](https://github.com/solana-labs/solana-web3.js/commit/2d5465018d8060eceb00efbf4f718df26d145199), [`bef9604`](https://github.com/solana-labs/solana-web3.js/commit/bef960435eb2303395bfa76e44f84d3348c5722d), [`7e86583`](https://github.com/solana-labs/solana-web3.js/commit/7e86583da68695076ec62033f3fe078b3890f026), [`2e5af9f`](https://github.com/solana-labs/solana-web3.js/commit/2e5af9f1a9410f15108863342b48225fdf9a0c83), [`288029a`](https://github.com/solana-labs/solana-web3.js/commit/288029a55a5eeb863b6df960027a59214ffc37f1), [`4ae78f5`](https://github.com/solana-labs/solana-web3.js/commit/4ae78f5cdddd6772b25351beb813483d4e52cea6), [`478443f`](https://github.com/solana-labs/solana-web3.js/commit/478443fedac06678f12e8ac285aa7c7fcf503ee8)]:
    -   @solana/errors@2.0.0-preview.3
    -   @solana/codecs-core@2.0.0-preview.3
    -   @solana/codecs-numbers@2.0.0-preview.3

## 2.0.0-preview.2

### Patch Changes

-   The first Technology Preview of `@solana/web3.js` 2.0 was [released at the Breakpoint conference](https://www.youtube.com/watch?v=JUJtAPhES5g) in November 2023. Based on your feedback, we want to get a second version of it into your hands now with some changes, bug fixes, and new features.

    To install the second Technology Preview:

    ```shell
    npm install --save @solana/web3.js@tp2
    ```

    Most notably, this release integrates with the new JavaScript client generator for on-chain programs. Instruction creators and account decoders can now be autogenerated for any program, including your own! Read more [here](https://github.com/solana-program/create-solana-program), and check out the growing list of autogenerated core programs [here](https://www.npmjs.com/search?q=%40solana-program).

    Try a demo of Technology Preview 2 in your browser at https://sola.na/web3tp2demo.

    -   Renamed `Base58EncodedAddress` to `Address` (#1814) [63683a4bc](https://github.com/solana-labs/solana-web3.js/commit/63683a4bc)
    -   Renamed `Ed25519Signature` and `TransactionSignature` to `SignatureBytes` and `Signature` (#1815) [205c09268](https://github.com/solana-labs/solana-web3.js/commit/205c09268)
    -   Fixed return type of `getSignaturesForAddress` (#1821) [36c7263bd](https://github.com/solana-labs/solana-web3.js/commit/36c7263bd)
    -   `signTransaction` now asserts that the transaction is fully signed; added `partiallySignTransaction` that does not (#1820) [7d54c2dad](https://github.com/solana-labs/solana-web3.js/commit/7d54c2dad)
    -   The `@solana/webcrypto-ed25519-polyfill` now sets the `crypto` global in Node [17a54d24a](https://github.com/solana-labs/solana-web3.js/commit/17a54d24a)
    -   Added `assertIsBlockhashLifetimeTransaction` that asserts transaction has a blockhash lifetime (#1908) [ae94ca38d](https://github.com/solana-labs/solana-web3.js/commit/ae94ca38d)
    -   Added a `createPrivateKeyFromBytes` helper (#1913) [85b7dfe13](https://github.com/solana-labs/solana-web3.js/commit/85b7dfe13)
    -   Added `@solana/accounts`; types and helper methods for representing, fetching and decoding Solana accounts (#1855) [e1ca3966e](https://github.com/solana-labs/solana-web3.js/commit/e1ca3966e)
    -   Export the TransactionError type (#1964) [4c009bf5b](https://github.com/solana-labs/solana-web3.js/commit/4c009bf5b)
    -   Export all RPC method XApi types from `@solana/rpc-core` (#1965) [ed98b3d9c](https://github.com/solana-labs/solana-web3.js/commit/ed98b3d9c)
    -   Added a generic `createJsonRpcApi` function for custom APIs [1e2106f21](https://github.com/solana-labs/solana-web3.js/commit/1e2106f21)
    -   Added a generic `createJsonRpcSubscriptionsApi` function for custom APIs [ae3f1f087](https://github.com/solana-labs/solana-web3.js/commit/ae3f1f087)
    -   RPC commitment now defaults to `confirmed` when not explicitly specified [cb7702ca5](https://github.com/solana-labs/solana-web3.js/commit/cb7702ca5)
    -   Added `ClusterUrl` types and handlers (#2084) [61f7ba0](https://github.com/solana-labs/solana-web3.js/commit/61f7ba0)
    -   RPC transports can now be cluster-specific, ie. `RpcDevnet<TRpcMethods>` & `RpcSubscriptionsDevnet<TRpcMethods>` (#2053) [e58bb22](https://github.com/solana-labs/solana-web3.js/commit/e58bb22), (#2056) [cbf8f38](https://github.com/solana-labs/solana-web3.js/commit/cbf8f38)
    -   RPC APIs can now be cluster-specific, ie. `SolanaRpcMethodsDevnet` (#2054) [5175d8a](https://github.com/solana-labs/solana-web3.js/commit/5175d8a)
    -   Added cluster-level RPC support for `@solana/web3.js` (#2055) [5a6335d](https://github.com/solana-labs/solana-web3.js/commit/5a6335d), (#2058) [0e03ca9](https://github.com/solana-labs/solana-web3.js/commit/0e03ca9)
    -   Added `@solana/signers`; an abstraction layer over signing messages and transactions in Solana (#1710) [7c29a1e](https://github.com/solana-labs/solana-web3.js/commit/7c29a1e)
    -   Updated codec such that only one instance of `Uint8Array` is created when encoding data. This allows `Encoders` to set data at different offsets and therefore enables non-linear serialization (#1865) [7800e3b](https://github.com/solana-labs/solana-web3.js/commit/7800e3b)
    -   Added `FixedSize*` and `VariableSize*` type variants for `Codecs`, `Encoders` and `Decoders` (#1883) [5e58d5c](https://github.com/solana-labs/solana-web3.js/commit/5e58d5c)
    -   Repaired some inaccurate RPC method signatures (#2137) [bb65ba9](https://github.com/solana-labs/solana-web3.js/commit/bb65ba9)
    -   Renamed transaction/airdrop sender factories with the ‘Factory’ suffix (#2130) [2d1d49c](https://github.com/solana-labs/solana-web3.js/commit/2d1d49c5467e5cb13871067c3dc0f9c87f007b9f)
    -   All code now throws coded exceptions defined in `@solana/errors` which can be refined using `isSolanaError()` and decoded in production using `npx @solana/errors decode` (#2160) [3524f2c](https://github.com/solana-labs/solana-web3.js/commit/3524f2c583dbc663cf6dcb73a01b0beed6cfd136), (#2161) [94944b](https://github.com/solana-labs/solana-web3.js/commit/94944b65b9d957ca95653d66dc1f4805f1a36740), (#2213) [8541c2e](https://github.com/solana-labs/solana-web3.js/commit/8541c2ef860535514fa39c4b9a6a75276417ffaa), (#2220) [c9b2705](https://github.com/solana-labs/solana-web3.js/commit/c9b2705318724bbccb05efdb1ddc088dd82921b2), (#2207) [75a18e3](https://github.com/solana-labs/solana-web3.js/commit/75a18e30524078ea1e8c07133fd6c75fad357db3), (#2224) [613053d](https://github.com/solana-labs/solana-web3.js/commit/613053deab85e5a8703e241ab138ec51cc54885a), (#2226) [94fee67](https://github.com/solana-labs/solana-web3.js/commit/94fee67560faae1f41aeddb2e7c3d0d9078ab851), (#2228) [483c674](https://github.com/solana-labs/solana-web3.js/commit/483c674a8b19f146c7dba5f1eb64182f01fdcdc4), (#2235) [803b2d8](https://github.com/solana-labs/solana-web3.js/commit/803b2d88e9e39cecf18f03b2130507dea7230423), (#2236) [cf9c20c](https://github.com/solana-labs/solana-web3.js/commit/cf9c20ceed7186f5af704ee646344c42d4ec0084), (#2242) [9084fdd](https://github.com/solana-labs/solana-web3.js/commit/9084fddec79eebb9c00c70738e43b4bfb01bf352), (#2245) [e374ac6](https://github.com/solana-labs/solana-web3.js/commit/e374ac67ad48a121470d125a1d08485b8b529b2b), (#2186) [546263e](https://github.com/solana-labs/solana-web3.js/commit/546263e251c8a7b08949b01d0d51fa2398dc7fff), (#2187) [bea19d2](https://github.com/solana-labs/solana-web3.js/commit/bea19d209ea6b02351c21a878200f87da1e9b4be), (#2188) [2e0ae95](https://github.com/solana-labs/solana-web3.js/commit/2e0ae95ffc2738ae047249c7f64c46a95e9573d1), (#2189) [7712fc3](https://github.com/solana-labs/solana-web3.js/commit/7712fc32ef33bfe7f235d85d3ba2308ba6884143), (#2190) [7d67615](https://github.com/solana-labs/solana-web3.js/commit/7d67615ac1ae771810dfc544ecc17d664a0fc11d), (#2191) [0ba8f21](https://github.com/solana-labs/solana-web3.js/commit/0ba8f216d962d61e0f653404c4a9289e59712cc2), (#2192) [91a360d](https://github.com/solana-labs/solana-web3.js/commit/91a360daf5c66ac0f1bae7347298f25ae89329b2), (#2202) [a71a2db](https://github.com/solana-labs/solana-web3.js/commit/a71a2db4c35136c8650b56985bbd33c5413e1bbd), (#2286) [52a5d3d](https://github.com/solana-labs/solana-web3.js/commit/52a5d3db60e702ccf77b4d17b8a3fd388e6e8584), and more
    -   You can now supply a custom Undici dispatcher for use with the `fetch` API when creating an RPC transport in Node (#2178) [a2fc5a3](https://github.com/solana-labs/solana-web3.js/commit/a2fc5a3fda252cccc6ee62f2f7163d1578a20113)
    -   Added functions to assert a value is an `IInstructionWithAccounts` and IInstructionWithData` (#2212) [07c30c1](https://github.com/solana-labs/solana-web3.js/commit/07c30c14c7d5efd6121290db62fa40371f108778)
    -   Added a function to assert an instruction is for a given program (#2234) [fb655dd](https://github.com/solana-labs/solana-web3.js/commit/fb655ddd217e4c4f55c5c8a81a08177e20ef5431)
    -   You can now create an RPC using only a URL (#2238) [cd0b6c6](https://github.com/solana-labs/solana-web3.js/commit/cd0b6c616ded7d1fdee33e33d3e44ce9bce48cef), (#2239) [fc11993](https://github.com/solana-labs/solana-web3.js/commit/fc119937ade7e46f487c99f254ff5a874e524c2c)
    -   You can now resize codec with the `resizeCodec` helper (#2293) [606de63](https://github.com/solana-labs/solana-web3.js/commit/606de638e21eebd0535806dee445e6d046cfb074)
    -   You can now skip bytes while writing byte buffers using the `offsetCodec` helper (#2294) [09d8cc8](https://github.com/solana-labs/solana-web3.js/commit/09d8cc815d133d70da0db93c9a0c0092e0d9a929)
    -   You can now now pad the beginning or end of byte buffers using the `padLeftCodec` and `padRightCodec` helpers (#2314) [f9509c7](https://github.com/solana-labs/solana-web3.js/commit/f9509c77dd6ec92357edbbe18acbb76c5a33e4b2)
    -   Added a new `@solana/sysvars` package for fetching, decoding, and building transactions with sysvar accounts (#2041)

-   Updated dependencies [[`0546a8c`](https://github.com/solana-labs/solana-web3.js/commit/0546a8ce95b6852324d58bb32ac31480506193a7)]:
    -   @solana/codecs-core@2.0.0-preview.2
    -   @solana/codecs-numbers@2.0.0-preview.2
    -   @solana/errors@2.0.0-preview.2
