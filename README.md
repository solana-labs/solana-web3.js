
# JavaScript API

This is the Velas Javascript API built on [JSON RPC API](https://docs.velas.com/apps/javascript-api)


## Installation

### Yarn
```
$ yarn add @velas/web3.js
```

### npm
```
$ npm install --save @velas/web3.js
```

### Browser bundle
```html
<!-- Development (un-minified) -->
<script src="https://unpkg.com/@velas/web3.js@0.92.0/lib/index.iife.js"></script>

<!-- Production (un-minified) -->
<script src="https://unpkg.com/@velas/web3.js@0.92.0/lib/index.iife.min.js"></script>
```

## Development Environment Setup

Install the latest Velas release from https://docs.velas.com/cli/install-velas-cli-tools

### BPF program development

**Use `cargo build-bpf` from the latest release**

## Usage

### Javascript
```js
const velasWeb3 = require('@velas/web3.js');
console.log(velasWeb3);
```

### ES6
```js
import velasWeb3 from '@velas/web3.js';
console.log(velasWeb3);
```

### Browser bundle
```js
// `velasWeb3` is provided in the global namespace by the `velasWeb3.min.js` script bundle.
console.log(velasWeb3);
```


## Releases
Releases are available on [Github](https://github.com/velas/web3.js/releases)
and [npmjs.com](https://www.npmjs.com/package/@velas/web3.js)

Each Github release features a tarball containing API documentation and a
minified version of the module suitable for direct use in a browser environment
(&lt;script&gt; tag)
