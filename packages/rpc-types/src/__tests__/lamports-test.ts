import { SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE, SolanaError } from '@solana/errors';

import { assertIsLamports } from '../lamports';

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
});
