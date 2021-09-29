
# JavaScript API

This is the Velas Javascript API built on [JSON RPC API](https://docs.velas.com/apps/javascript-api)

## Installation

### Yarn

```
$ yarn add @velas/web3
```

### npm

```
$ npm install --save @velas/web3
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
## Examples

Example scripts for the web3.js repo and native programs:

- [Web3 Examples](./examples)

Example scripts for the Solana Program Library:

- [Token Program Examples](https://github.com/solana-labs/solana-program-library/tree/master/token/js/examples)

## Flow

A [Flow library definition](https://flow.org/en/docs/libdefs/) is provided at
https://unpkg.com/@solana/web3.js@latest/module.flow.js.
Download the file and add the following line under the [libs] section of your project's `.flowconfig` to
activate it:

```ini
[libs]
node_modules/@solana/web3.js/module.flow.js
```

## Releases
Releases are available on [Github](https://github.com/velas/web3.js/releases)
and [npmjs.com](https://www.npmjs.com/package/@velas/web3.js)

Each Github release features a tarball containing API documentation and a
minified version of the module suitable for direct use in a browser environment
(`<script>` tag)

## Disclaimer

All claims, content, designs, algorithms, estimates, roadmaps,
specifications, and performance measurements described in this project
are done with the Solana Foundation's ("SF") best efforts. It is up to
the reader to check and validate their accuracy and truthfulness.
Furthermore nothing in this project constitutes a solicitation for
investment.

Any content produced by SF or developer resources that SF provides, are
for educational and inspiration purposes only. SF does not encourage,
induce or sanction the deployment, integration or use of any such
applications (including the code comprising the Solana blockchain
protocol) in violation of applicable laws or regulations and hereby
prohibits any such deployment, integration or use. This includes use of
any such applications by the reader (a) in violation of export control
or sanctions laws of the United States or any other applicable
jurisdiction, (b) if the reader is located in or ordinarily resident in
a country or territory subject to comprehensive sanctions administered
by the U.S. Office of Foreign Assets Control (OFAC), or (c) if the
reader is or is working on behalf of a Specially Designated National
(SDN) or a person subject to similar blocking or denied party
prohibitions.

The reader should be aware that U.S. export control and sanctions laws
prohibit U.S. persons (and other persons that are subject to such laws)
from transacting with persons in certain countries and territories or
that are on the SDN list. As a project based primarily on open-source
software, it is possible that such sanctioned persons may nevertheless
bypass prohibitions, obtain the code comprising the Solana blockchain
protocol (or other project code or applications) and deploy, integrate,
or otherwise use it. Accordingly, there is a risk to individuals that
other persons using the Solana blockchain protocol may be sanctioned
persons and that transactions with such persons would be a violation of
U.S. export controls and sanctions law. This risk applies to
individuals, organizations, and other ecosystem participants that
deploy, integrate, or use the Solana blockchain protocol code directly
(e.g., as a node operator), and individuals that transact on the Solana
blockchain through light clients, third party interfaces, and/or wallet
software.
