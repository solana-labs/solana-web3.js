---
'@solana/rpc-transport-http': minor
'@solana/errors': minor
---

When the HTTP transport throws an error, you can now access the response headers through `e.context.headers`. This can be useful, for instance, if the HTTP error is a 429 Rate Limit error, and the response contains a `Retry-After` header.

```ts
try {
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
} catch (e) {
    if (isSolanaError(e, SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR)) {
        if (e.context.code === 429 /* rate limit error */) {
            const retryAfterHeaderValue = e.context.headers.get('Retry-After');
            if (retryAfterHeaderValue != null) {
                // ...
            }
        }
    }
}
```
