---
'@solana/errors': patch
'@solana/rpc': patch
'@solana/rpc-subscriptions': patch
'@solana/rpc-subscriptions-transport-websocket': patch
'@solana/rpc-transport-http': patch
'@solana/webcrypto-ed25519-polyfill': patch
---

`__DEV__` mode will now be the default if you don't set `process.env.NODE_ENV` at all. This means fewer people ‘accidentally’ finding themselves in production mode with minified error messages.
