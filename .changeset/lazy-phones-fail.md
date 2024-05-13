---
"@solana/codecs-data-structures": patch
"@solana/options": patch
"@solana/codecs": patch
---

Consolidated `getNullableCodec` and `getOptionCodec` with their `Zeroable` counterparts and added more configurations

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
