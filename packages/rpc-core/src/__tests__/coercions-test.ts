import { lamports, LamportsUnsafeBeyond2Pow53Minus1 } from '../lamports';
import { StringifiedBigInt, stringifiedBigInt } from '../stringified-bigint';
import { StringifiedNumber, stringifiedNumber } from '../stringified-number';
import { TransactionSignature, transactionSignature } from '../transaction-signature';
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
            expect(thisThrows).toThrow('Input for 64-bit unsigned integer cannot be negative');
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
            expect(thisThrows).toThrow('`test` cannot be parsed as a BigInt');
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
            expect(thisThrows).toThrow('`test` cannot be parsed as a Number');
        });
    });
    describe('transactionSignature', () => {
        it('can coerce to `TransactionSignature`', () => {
            // Randomly generated
            const raw =
                '3bwsNoq6EP89sShUAKBeB26aCC3KLGNajRm5wqwr6zRPP3gErZH7erSg3332SVY7Ru6cME43qT35Z7JKpZqCoPaL' as TransactionSignature;
            const coerced = transactionSignature(
                '3bwsNoq6EP89sShUAKBeB26aCC3KLGNajRm5wqwr6zRPP3gErZH7erSg3332SVY7Ru6cME43qT35Z7JKpZqCoPaL'
            );
            expect(coerced).toBe(raw);
        });
        it('throws on invalid `TransactionSignature`', () => {
            const thisThrows = () => transactionSignature('test');
            expect(thisThrows).toThrow('`test` is not a transaction signature');
        });
    });
    describe('unixTimestamp', () => {
        it('can coerce to `UnixTimestamp`', () => {
            const raw = 1234 as UnixTimestamp;
            const coerced = unixTimestamp(1234);
            expect(coerced).toBe(raw);
        });
        it('throws on invalid `UnixTimestamp`', () => {
            const thisThrows = () => unixTimestamp(8.75e15);
            expect(thisThrows).toThrow('`8750000000000000` is not a timestamp');
        });
    });
});
