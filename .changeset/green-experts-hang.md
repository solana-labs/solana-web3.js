---
'@solana/codecs-data-structures': patch
---

Improve `getTupleCodec` type inferences and performance

The tuple codec now infers its encoded/decoded type from the provided codec array and uses the new `DrainOuterGeneric` helper to reduce the number of TypeScript instantiations.
