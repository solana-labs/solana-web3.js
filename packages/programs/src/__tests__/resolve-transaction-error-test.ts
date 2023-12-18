import { Address } from '@solana/addresses';
import { pipe } from '@solana/functional';
import { appendTransactionInstruction, createTransaction } from '@solana/transactions';

import { Program, ProgramWithErrors } from '../program';
import { resolveTransactionError } from '../resolve-transaction-error';

function getMockProgram<TAddress extends string>(
    address: Address<TAddress>,
): Program<TAddress> & ProgramWithErrors & { getErrorFromCode: jest.Mock } {
    return {
        address,
        getErrorFromCode: jest.fn(),
        name: 'mockProgram',
    };
}

function getErrorWithLogs(message: string, logs: string[]) {
    const error = new Error(message) as Error & { logs: string[] };
    error.logs = logs;
    return error as Error & Readonly<{ logs?: readonly string[] }>;
}

describe('resolveTransactionError', () => {
    it('can resolve custom program errors from a given transaction error with logs', () => {
        // Given two registered programs.
        const programA = getMockProgram('1111' as Address<'1111'>);
        const programB = getMockProgram('2222' as Address<'2222'>);
        const programs = [programA, programB];

        // And given program B is mocked to return the following error for any error code.
        const expectedError = new Error();
        programB.getErrorFromCode.mockReturnValueOnce(expectedError);

        // And given the following transaction such that both programs are invoked.
        const transaction = pipe(
            createTransaction({ version: 0 }),
            tx => appendTransactionInstruction({ programAddress: programA.address }, tx),
            tx => appendTransactionInstruction({ programAddress: programB.address }, tx),
        );

        // And given the following error with logs.
        const error = getErrorWithLogs(
            'JSON-RPC 2.0 error (-32002): Transaction simulation failed: Error processing Instruction 1',
            [
                'Program 1111 invoke [1]',
                'Transfer: insufficient lamports 499995000, need 1000000000',
                'Program 1111 failed: custom program error: 0x2a',
            ],
        );

        // When we resolve the transaction error from the registered programs.
        const resolvedError = resolveTransactionError(error, transaction, programs);

        // Then we expect the resolved error to be the mocked error from program B.
        expect(resolvedError).toBe(expectedError);

        // And only program B was called with the appropriate error code and initial error.
        expect(programB.getErrorFromCode).toHaveBeenCalledWith(42, error);
        expect(programA.getErrorFromCode).not.toHaveBeenCalled();
    });

    it('can resolve custom program errors from a given transaction error without logs', () => {
        // Given two registered programs.
        const programA = getMockProgram('1111' as Address<'1111'>);
        const programB = getMockProgram('2222' as Address<'2222'>);
        const programs = [programA, programB];

        // And given program B is mocked to return the following error for any error code.
        const expectedError = new Error();
        programB.getErrorFromCode.mockReturnValueOnce(expectedError);

        // And given the following transaction such that both programs are invoked.
        const transaction = pipe(
            createTransaction({ version: 0 }),
            tx => appendTransactionInstruction({ programAddress: programA.address }, tx),
            tx => appendTransactionInstruction({ programAddress: programB.address }, tx),
        );

        // And given the following error without logs such that
        // all the information we need is in the error message.
        const error = getErrorWithLogs(
            'JSON-RPC 2.0 error (-32002): Transaction simulation failed: Error processing Instruction 1: custom program error: 0x2a',
            [],
        );

        // When we resolve the transaction error from the registered programs.
        const resolvedError = resolveTransactionError(error, transaction, programs);

        // Then we expect the resolved error to be the mocked error from program B.
        expect(resolvedError).toBe(expectedError);

        // And only program B was called with the appropriate error code and initial error.
        expect(programB.getErrorFromCode).toHaveBeenCalledWith(42, error);
        expect(programA.getErrorFromCode).not.toHaveBeenCalled();
    });

    it('returns the original error instance when the error could not be resolved', () => {
        // Given two registered programs.
        const programA = getMockProgram('1111' as Address<'1111'>);
        const programB = getMockProgram('2222' as Address<'2222'>);
        const programs = [programA, programB];

        // And given the following transaction such that both programs are invoked.
        const transaction = pipe(
            createTransaction({ version: 0 }),
            tx => appendTransactionInstruction({ programAddress: programA.address }, tx),
            tx => appendTransactionInstruction({ programAddress: programB.address }, tx),
        );

        // And given the following error such that we are unable to parse the instruction index.
        const error = getErrorWithLogs(
            'JSON-RPC 2.0 error (-32002): Transaction simulation failed: Error processing Instruction MISSING: custom program error: 0x2a',
            [],
        );

        // When we try to resolve the transaction error from the registered programs.
        const resolvedError = resolveTransactionError(error, transaction, programs);

        // Then we expect the resolved error to be the original error.
        expect(resolvedError).toBe(error);

        // And no program was called to resolve the error.
        expect(programA.getErrorFromCode).not.toHaveBeenCalled();
        expect(programB.getErrorFromCode).not.toHaveBeenCalled();
    });
});
