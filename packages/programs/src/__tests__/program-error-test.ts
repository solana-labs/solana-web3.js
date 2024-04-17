import { Address } from '@solana/addresses';
import { SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM, SolanaError } from '@solana/errors';
import { pipe } from '@solana/functional';
import { appendTransactionMessageInstruction, createTransactionMessage } from '@solana/transaction-messages';

import { isProgramError } from '../program-error';

describe('isProgramError', () => {
    it('identifies an error as a custom program error', () => {
        // Given a transaction message with a single instruction.
        const programAddress = '1111' as Address;
        const tx = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction({ programAddress }, tx),
        );

        // And a custom program error on the instruction.
        const error = new SolanaError(SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM, {
            code: 42,
            index: 0,
        });

        // Then we expect the error to be identified as a program error.
        expect(isProgramError(error, tx, programAddress)).toBe(true);
    });

    it('matches the provided custom program error code', () => {
        // Given a transaction message with a single instruction.
        const programAddress = '1111' as Address;
        const tx = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction({ programAddress }, tx),
        );

        // And a custom program error with code 42.
        const error = new SolanaError(SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM, {
            code: 42,
            index: 0,
        });

        // When we specify the custom program error code 42.
        const result = isProgramError(error, tx, programAddress, 42);

        // Then we expect the result to be true.
        expect(result).toBe(true);
    });

    it('returns false if the program address does not match', () => {
        // Given a transaction message with a program A instruction.
        const programA = '1111' as Address;
        const tx = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction({ programAddress: programA }, tx),
        );

        // And a custom program error on the instruction.
        const error = new SolanaError(SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM, {
            code: 42,
            index: 0,
        });

        // When we try to identify the error as a program error for program B.
        const programB = '2222' as Address;
        const result = isProgramError(error, tx, programB);

        // Then we expect the result to be false.
        expect(result).toBe(false);
    });

    it('returns false if the instruction is missing', () => {
        // Given a transaction message with a single instruction.
        const programAddress = '1111' as Address;
        const tx = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction({ programAddress }, tx),
        );

        // And a custom program error pointing to a missing instruction.
        const error = new SolanaError(SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM, {
            code: 42,
            index: 999,
        });

        // Then we expect the error not to be identified as a program error.
        expect(isProgramError(error, tx, programAddress)).toBe(false);
    });

    it('returns false if the custom program error code does not match', () => {
        // Given a transaction message with a single instruction.
        const programAddress = '1111' as Address;
        const tx = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction({ programAddress }, tx),
        );

        // And a custom program error on the instruction with code 42.
        const error = new SolanaError(SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM, {
            code: 42,
            index: 0,
        });

        // When we try to identify the error as a program error with code 43.
        const result = isProgramError(error, tx, programAddress, 43);

        // Then we expect the result to be false.
        expect(result).toBe(false);
    });
});
