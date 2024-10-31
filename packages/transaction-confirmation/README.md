[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/transaction-confirmation/rc.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/transaction-confirmation/rc.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/transaction-confirmation/v/rc

# @solana/transaction-confirmation

This package contains utilities for confirming transactions and for building your own transaction confirmation strategies.

## Functions

### `createBlockHeightExceedencePromiseFactory()`

When a transaction's lifetime is tied to a blockhash, that transaction can be landed on the network until that blockhash expires. All blockhashes have a block height after which they are considered to have expired. A block height exceedence promise throws when the network progresses past that block height.

```ts
import { isSolanaError, SolanaError } from '@solana/errors';
import { createBlockHeightExceedencePromiseFactory } from '@solana/transaction-confirmation';

const getBlockHeightExceedencePromise = createBlockHeightExceedencePromiseFactory({
    rpc,
    rpcSubscriptions,
});
try {
    await getBlockHeightExceedencePromise({ lastValidBlockHeight });
} catch (e) {
    if (isSolanaError(e, SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED)) {
        console.error(
            `The block height of the network has exceeded ${e.context.lastValidBlockHeight}. ` +
                `It is now ${e.context.currentBlockHeight}`,
        );
        // Re-sign and retry the transaction.
        return;
    }
    throw e;
}
```

### `createNonceInvalidationPromiseFactory()`

When a transaction's lifetime is tied to the value stored in a nonce account, that transaction can be landed on the network until the nonce is advanced to a new value. A nonce invalidation promise throws when the value stored in a nonce account is not the expected one.

```ts
import { isSolanaError, SolanaError } from '@solana/errors';
import { createNonceInvalidationPromiseFactory } from '@solana/transaction-confirmation';

const getNonceInvalidationPromise = createNonceInvalidationPromiseFactory({
    rpc,
    rpcSubscriptions,
});
try {
    await getNonceInvalidationPromise({
        currentNonceValue,
        nonceAccountAddress,
    });
} catch (e) {
    if (isSolanaError(e, SOLANA_ERROR__NONCE_INVALID)) {
        console.error(`The nonce has advanced to ${e.context.actualNonceValue}`);
        // Re-sign and retry the transaction.
        return;
    } else if (isSolanaError(e, SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND)) {
        console.error(`No nonce account was found at ${nonceAccountAddress}`);
    }
    throw e;
}
```

### `createRecentSignatureConfirmationPromiseFactory()`

The status of recently-landed transactions is available in the network's status cache. A recent signature confirmation promise resolves when a transaction achieves the target confirmation commitment, and throws when the transaction fails with an error.

```ts
import { createRecentSignatureConfirmationPromiseFactory } from '@solana/transaction-confirmation';

const getRecentSignatureConfirmationPromise = createRecentSignatureConfirmationPromiseFactory({
    rpc,
    rpcSubscriptions,
});
try {
    await getRecentSignatureConfirmationPromise({
        commitment,
        signature,
    });
    console.log(`The transaction with signature \`${signature}\` has achieved a commitment level of \`${commitment}\``);
} catch (e) {
    console.error(`The transaction with signature \`${signature}\` failed`, e.cause);
    throw e;
}
```

### `getTimeoutPromise()`

When no other heuristic exists to infer that a transaction has expired, you can use this promise factory with a commitment level. It throws after 30 seconds when the commitment is `processed`, and 60 seconds otherwise. You would typically race this with another confirmation strategy.

```ts
import { safeRace } from '@solana/promises';
import { getTimeoutPromise } from '@solana/transaction-confirmation';

try {
    await safeRace([getCustomTransactionConfirmationPromise(/* ... */), getTimeoutPromise({ commitment })]);
} catch (e) {
    if (e instanceof DOMException && e.name === 'TimeoutError') {
        console.log('Could not confirm transaction after a timeout');
    }
    throw e;
}
```

### `waitForDurableNonceTransactionConfirmation()`

Supply your own confirmation implementations to this function to create a custom nonce transaction confirmation strategy.

```ts
import { waitForDurableNonceTransactionConfirmation } from '@solana/transaction-confirmation';

try {
    await waitForDurableNonceTransactionConfirmation({
        getNonceInvalidationPromise({ abortSignal, commitment, currentNonceValue, nonceAccountAddress }) {
            // Return a promise that rejects when a nonce becomes invalid.
        },
        getRecentSignatureConfirmationPromise({ abortSignal, commitment, signature }) {
            // Return a promise that resolves when a transaction achieves confirmation
        },
    });
} catch (e) {
    // Handle errors.
}
```

### `waitForRecentTransactionConfirmation()`

Supply your own confirmation implementations to this function to create a custom nonce transaction confirmation strategy.

```ts
import { waitForRecentTransactionConfirmation } from '@solana/transaction-confirmation';

try {
    await waitForRecentTransactionConfirmation({
        getBlockHeightExceedencePromise({ abortSignal, commitment, lastValidBlockHeight }) {
            // Return a promise that rejects when the blockhash's block height has been exceeded
        },
        getRecentSignatureConfirmationPromise({ abortSignal, commitment, signature }) {
            // Return a promise that resolves when a transaction achieves confirmation
        },
    });
} catch (e) {
    // Handle errors.
}
```

### `waitForRecentTransactionConfirmationUntilTimeout()`

Supply your own confirmation implementations to this function to create a custom nonce transaction confirmation strategy.

```ts
import { waitForRecentTransactionConfirmationUntilTimeout } from '@solana/transaction-confirmation';

try {
    await waitForRecentTransactionConfirmationUntilTimeout({
        getTimeoutPromise({ abortSignal, commitment }) {
            // Return a promise that rejects after your chosen timeout
        },
        getRecentSignatureConfirmationPromise({ abortSignal, commitment, signature }) {
            // Return a promise that resolves when a transaction achieves confirmation
        },
    });
} catch (e) {
    // Handle errors.
}
```
