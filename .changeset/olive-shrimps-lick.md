---
'@solana/assertions': patch
---

Fixed a bug where calls to `isEd25519CurveSupported()` might have resulted in uncaught rejections bubbling up through the app, in cases where Ed25519 is not supported
