---
'@solana/rpc-subscriptions': patch
---

Add a \`getRpcSubscriptionsChannelWithBigIntJSONSerialization\` helper function that parses and stringifies JSON messages with support for \`BigInt\` values. Any integer value is parsed as a \`BigInt\` in order to safely handle numbers that exceed the JavaScript \`Number.MAX_SAFE_INTEGER\` value.
