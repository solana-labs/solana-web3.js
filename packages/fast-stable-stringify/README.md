# fast-stable-stringify

_Notice: The License of this repository has been changed from GPL-3.0 to MIT as of 2017-08-25. All following commits will fall under the MIT license._

The most popular repository providing this feature is [substack's json-stable-stringify][sub]. The intent if this library is to provide a faster alternative for when performance is more important than features. It assumes you provide basic javascript values without circular references, and returns a non-indented string.

Usage:

```javascript
var stringify = require('fast-stable-stringify');
stringify({ d: 0, c: 1, a: 2, b: 3, e: 4 }); // '{"a":2,"b":3,"c":1,"d":0,"e":4}'
```

### Features

-   handle all variations of all basic javascript values (number, string, boolean, array, object, null, Date, BigInt)
-   handle undefined _and_ function in the same way as `JSON.stringify`

## Running tests

It runs tests using mocha. For testing in node, do:

```
npm test
```
