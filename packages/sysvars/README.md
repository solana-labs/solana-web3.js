[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/sysvars/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/sysvars/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/sysvars/v/rc

# @solana/sysvars

This package contains types and helpers for fetching and decoding Solana
sysvars. It can be used standalone, but it is also exported as part of the
Solana JavaScript SDK
[`@solana/web3.js@rc`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

More information about the available sysvars on Solana can be found in the docs
at <https://docs.solanalabs.com/runtime/sysvars>.

All currently available sysvars can be retrieved and/or decoded using this
library.

## Sysvar API

This package offers a simple API for working with sysvars.

One can fetch an encoded sysvar account using an RPC client.

```ts
const maybeEncodedClock = await fetchEncodedSysvarAccount(rpc, SYSVAR_CLOCK_ADDRESS);
maybeEncodedClock satisfies MaybeEncodedAccount<'SysvarC1ock11111111111111111111111111111111'>;
```

One can also attempt to fetch a JSON-parsed sysvar account.

```ts
const maybeJsonParsedClock = await fetchJsonParsedSysvarAccount(rpc, SYSVAR_CLOCK_ADDRESS);
maybeJsonParsedClock satisfies
    | MaybeAccount<JsonParsedSysvarAccount, 'SysvarC1ock11111111111111111111111111111111'>
    | MaybeEncodedAccount<'SysvarC1ock11111111111111111111111111111111'>;
```

Each sysvar within the library ships with its own
[codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs)
for deserializing the account data.

You can pair this codec with the helpers from
[`@solana/accounts`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/accounts)
to assert and decode sysvar account data.

```ts
// Fetch.
const clock = await fetchEncodedSysvarAccount(rpc, SYSVAR_CLOCK_ADDRESS);
clock satisfies MaybeEncodedAccount<'SysvarC1ock11111111111111111111111111111111'>;

// Assert.
assertAccountExists(clock);
clock satisfies EncodedAccount<'SysvarC1ock11111111111111111111111111111111'>;

// Decode.
const decodedClock = decodeAccount(clock, getSysvarClockDecoder());
decodedClock satisfies Account<SysvarClock, 'SysvarC1ock11111111111111111111111111111111'>;
```

Each supported sysvar also ships with its own fetch-and-decode function to
perform the steps above and return the decoded sysvar data.

```ts
const clock: SysvarClock = await fetchSysvarClock(rpc);
```

## Supported Sysvars:

This package supports the following Solana sysvars:

-   [`Clock`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/sysvars/src/clock.ts)
-   [`EpochRewards`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/sysvars/src/epoch-rewards.ts)
-   [`EpochSchedule`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/sysvars/src/epoch-schedule.ts)
-   [`Fees`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/sysvars/src/fees.ts)
-   [`LastRestartSlot`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/sysvars/src/last-restart-slot.ts)
-   [`RecentBlockhashes`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/sysvars/src/recent-blockhashes.ts)
-   [`Rent`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/sysvars/src/rent.ts)
-   [`SlotHashes`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/sysvars/src/slot-hashes.ts)
-   [`SlotHistory`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/sysvars/src/slot-history.ts)
-   [`StakeHistory`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/sysvars/src/stake-history.ts)

The `Instructions` sysvar is also supported but does not exist on-chain,
therefore has no corresponding module or codec.
