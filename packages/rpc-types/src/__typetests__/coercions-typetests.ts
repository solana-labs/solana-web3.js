import { Lamports, lamports } from '../lamports';
import { StringifiedBigInt, stringifiedBigInt } from '../stringified-bigint';
import { StringifiedNumber, stringifiedNumber } from '../stringified-number';
import { UnixTimestamp, unixTimestamp } from '../unix-timestamp';

lamports(50_000_000_000_000n) satisfies Lamports;
stringifiedBigInt('50_000_000_000_000') satisfies StringifiedBigInt;
stringifiedNumber('50_000_000_000_000') satisfies StringifiedNumber;
unixTimestamp(0n) satisfies UnixTimestamp;
