import {
    SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE,
    SOLANA_ERROR__MALFORMED_BIGINT_STRING,
    SOLANA_ERROR__MALFORMED_NUMBER_STRING,
    SOLANA_ERROR__TIMESTAMP_OUT_OF_RANGE,
    SolanaError,
} from '@solana/errors';

import { lamports, LamportsUnsafeBeyond2Pow53Minus1 } from '../lamports';
import { StringifiedBigInt, stringifiedBigInt } from '../stringified-bigint';
import { StringifiedNumber, stringifiedNumber } from '../stringified-number';
import { UnixTimestamp, unixTimestamp } from '../unix-timestamp';

describe('coercions', () => {
    describe('lamports', () => {
        it('can coerce to `LamportsUnsafeBeyond2Pow53Minus1`', () => {
            const raw = 1234n as LamportsUnsafeBeyond2Pow53Minus1;
            const coerced = lamports(1234n);
            expect(coerced).toBe(raw);
        });
        it('throws on invalid `LamportsUnsafeBeyond2Pow53Minus1`', () => {
            const thisThrows = () => lamports(-5n);
            expect(thisThrows).toThrow(new SolanaError(SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE));
        });
    });
    describe('stringifiedBigInt', () => {
        it('can coerce to `StringifiedBigInt`', () => {
            const raw = '1234' as StringifiedBigInt;
            const coerced = stringifiedBigInt('1234');
            expect(coerced).toBe(raw);
        });
        it('throws on invalid `StringifiedBigInt`', () => {
            const thisThrows = () => stringifiedBigInt('test');
            expect(thisThrows).toThrow(
                new SolanaError(SOLANA_ERROR__MALFORMED_BIGINT_STRING, {
                    value: 'test',
                }),
            );
        });
    });
    describe('stringifiedNumber', () => {
        it('can coerce to `StringifiedNumber`', () => {
            const raw = '1234' as StringifiedNumber;
            const coerced = stringifiedNumber('1234');
            expect(coerced).toBe(raw);
        });
        it('throws on invalid `StringifiedNumber`', () => {
            const thisThrows = () => stringifiedNumber('test');
            expect(thisThrows).toThrow(
                new SolanaError(SOLANA_ERROR__MALFORMED_NUMBER_STRING, {
                    value: 'test',
                }),
            );
        });
    });
    describe('unixTimestamp', () => {
        it('can coerce to `UnixTimestamp`', () => {
            const raw = 1234 as UnixTimestamp;
            const coerced = unixTimestamp(1234);
            expect(coerced).toBe(raw);
        });
        it('throws on an out-of-range `UnixTimestamp`', () => {
            const thisThrows = () => unixTimestamp(8.75e15);
            expect(thisThrows).toThrow(
                new SolanaError(SOLANA_ERROR__TIMESTAMP_OUT_OF_RANGE, {
                    value: 8.75e15,
                }),
            );
        });
    });
});
