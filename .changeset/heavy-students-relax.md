---
'@solana/codecs-data-structures': patch
---

Use `DrainOuterGeneric` helper on codec type mappings

This significantly reduces the number of TypeScript instantiations on object mappings, 
which increases TypeScript performance and prevents "Type instantiation is excessively deep and possibly infinite" errors.
