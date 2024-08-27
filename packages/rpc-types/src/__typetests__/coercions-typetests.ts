import { lamports, LamportsUnsafeBeyond2Pow53Minus1 } from '../lamports';
import { StringifiedBigInt, stringifiedBigInt } from '../stringified-bigint';
import { StringifiedNumber, stringifiedNumber } from '../stringified-number';
import { unixTimestamp, UnixTimestampUnsafeBeyond2Pow53Minus1 } from '../unix-timestamp';

lamports(50_000_000_000_000n) satisfies LamportsUnsafeBeyond2Pow53Minus1;
stringifiedBigInt('50_000_000_000_000') satisfies StringifiedBigInt;
stringifiedNumber('50_000_000_000_000') satisfies StringifiedNumber;
unixTimestamp(0n) satisfies UnixTimestampUnsafeBeyond2Pow53Minus1;
