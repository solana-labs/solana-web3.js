import { SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE, SolanaError } from '@solana/errors';

import {
    assertIsLamports,
    getLamportsDecoder,
    getLamportsEncoder,
    lamports,
    LamportsUnsafeBeyond2Pow53Minus1,
} from '../lamports';

describe('assertIsLamports()', () => {
    it('throws when supplied a negative number', () => {
        expect(() => {
            assertIsLamports(-1n);
        }).toThrow(new SolanaError(SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE));
        expect(() => {
            assertIsLamports(-1000n);
        }).toThrow(new SolanaError(SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE));
    });
    it('throws when supplied a too large number', () => {
        expect(() => {
            assertIsLamports(2n ** 64n);
        }).toThrow(new SolanaError(SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE));
    });
    it('does not throw when supplied zero lamports', () => {
        expect(() => {
            assertIsLamports(0n);
        }).not.toThrow();
    });
    it('does not throw when supplied a valid non-zero number of lamports', () => {
        expect(() => {
            assertIsLamports(1_000_000_000n);
        }).not.toThrow();
    });
    it('does not throw when supplied the max valid number of lamports', () => {
        expect(() => {
            assertIsLamports(2n ** 64n - 1n);
        }).not.toThrow();
    });

    describe('getLamportsCodec', () => {
        it('serializes a lamports value into an 8-byte buffer', () => {
            const lamportsValue = lamports(1_000_000_000n);
            const encoder = getLamportsEncoder();
            const buffer = encoder.encode(lamportsValue);
            expect(buffer).toStrictEqual(new Uint8Array([0, 202, 154, 59, 0, 0, 0, 0]));
        });
        it('deserializes an 8-byte buffer into a lamports value', () => {
            const buffer = new Uint8Array([0, 29, 50, 247, 69, 0, 0, 0]);
            const decoder = getLamportsDecoder();
            const lamportsValue = decoder.decode(buffer);
            expect(lamportsValue).toStrictEqual<LamportsUnsafeBeyond2Pow53Minus1>(lamports(300_500_000_000n));
        });
    });
});
