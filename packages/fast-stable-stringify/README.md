# fast-stable-stringify

This project is a fork of [nickyout/fast-stable-stringify](https://github.com/nickyout/fast-stable-stringify)

The most popular repository providing this feature is [substack's json-stable-stringify](https://www.npmjs.com/package/json-stable-stringify). The intent of this library is to provide a faster alternative for when performance is more important than features. It assumes you provide basic javascript values without circular references, and returns a non-indented string.

Usage:

```javascript
import stringify from '@solana/fast-stable-stringify';
stringify({ d: 0, c: 1, a: 2, b: 3, e: 4 }); // '{"a":2,"b":3,"c":1,"d":0,"e":4}'
```

Just like substack's, it does:

-   handle all variations of all basic javascript values (number, string, boolean, array, object, null, Date, BigInt)
-   handle undefined _and_ function in the same way as `JSON.stringify`
-   **not support ie8 (and below) with complete certainty**.

Unlike substack's, it does:

-   not implement the 'replacer' or 'space' arguments of the JSON.stringify method
-   not check for circular references

## Running tests

```
npm run test:unit:browser
npm run test:unit:node
```
