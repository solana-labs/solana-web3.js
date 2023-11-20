[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/web3.js-legacy-sham/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/web3.js-legacy-sham/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/web3.js-legacy-sham/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/web3.js-legacy-sham

This package is a drop-in replacement for a _subset_ of the version `1.x` `@solana/web3.js` interfaces. Its goal is to satisfy the legacy interfaces with as little code as possible.

If you depend on web3.js _directly_ then you should not use this. Instead, migrate to version `>=2` of `@solana/web3.js`.

On the other hand, if you depend on the legacy library _transitively_ through a dependency that you don't control, you can use this sham to satisfy those libraries' dependency on the legacy web3.js interfaces with fewer bytes of JavaScript code.

## Usage

1. Install the library into your project
    ```shell
    npm install --save @solana/web3.js-legacy-sham
    ```
2. Override your dependencies' dependency on the legacy library in your `package.json`. As an example, imagine that you wish to override the Metaplex token metadata library's dependency on the legacy web3.js.
    - Using pnpm [`overrides`](https://pnpm.io/package_json#pnpmoverrides)
        ```json
        "pnpm": {
          "overrides": {
            "@metaplex-foundation/mpl-token-metadata>@solana/web3.js": "npm:@solana/web3.js-legacy-sham"
          }
        }
        ```
    - Using npm [`overrides`](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides)
        ```json
        "overrides": {
          "@metaplex-foundation/mpl-token-metadata": {
            "@solana/web3.js": "npm:@solana/web3.js-legacy-sham"
          }
        }
        ```
    - Using yarn [`resolutions`](https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/#toc-how-to-use-it)
        ```json
        "resolutions": {
          "@metaplex-foundation/mpl-token-metadata/@solana/web3.js": "npm:@solana/web3.js-legacy-sham"
        }
        ```
