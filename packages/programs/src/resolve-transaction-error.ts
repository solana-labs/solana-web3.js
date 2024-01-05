import type { Address } from '@solana/addresses';
import type { Transaction } from '@solana/transactions';

import { Program, ProgramWithErrors } from './program';

/**
 * Resolves a custom program error from a transaction error
 * with logs using the provided list of programs.
 * The original error is returned if the error cannot be
 * resolved from the given programs.
 *
 * @param error The raw error to resolve containing the program logs.
 * @param transaction The transaction that caused the error.
 * @param programs The list of programs to go through when resolving the transaction error.
 * They should ideally contain all programs the transaction is sending instructions to.
 * @returns The resolved program error, or the original transaction error
 * if the error cannot be resolved using the provided programs.
 */
export function resolveTransactionError(
    error: Error & Readonly<{ logs?: readonly string[] }>,
    transaction: Transaction,
    programs: Program[],
): Error {
    // Compute the full logs from which to parse the instruction index and error code.
    const fullLogs = error.message + '\n' + (error.logs ?? []).join('\n');

    // Parse the instruction number, or return the original error.
    const instructionRegex = /Error processing Instruction (\d+)/;
    const instructionIndexString = fullLogs.match(instructionRegex)?.[1] ?? null;
    const instructionIndex = instructionIndexString ? parseInt(instructionIndexString, 10) : null;
    if (instructionIndex === null) return error;

    // Parse the error code, or return the original error.
    const errorCodeRegex = /Custom program error: (0x[a-f0-9]+)/i;
    const errorCodeString = fullLogs.match(errorCodeRegex)?.[1] ?? null;
    const errorCode = errorCodeString ? parseInt(errorCodeString, 16) : null;
    if (errorCode === null) return error;

    // Get the program address from the instruction in the transaction, or return the original error.
    const programAddress: Address | null = transaction.instructions[instructionIndex]?.programAddress ?? null;
    if (!programAddress) return error;

    // Find a matching program with error handling, or return the original error.
    const program: ProgramWithErrors | null =
        programs.find(
            (program): program is Program & ProgramWithErrors =>
                program.address === programAddress && typeof program.getErrorFromCode !== 'undefined',
        ) ?? null;
    if (!program) return error;

    // Resolve the error from the identified program.
    return program.getErrorFromCode(errorCode, error);
}
