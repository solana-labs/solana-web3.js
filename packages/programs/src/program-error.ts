import type { Address } from '@solana/addresses';
import { isSolanaError, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM, SolanaError } from '@solana/errors';

export function isProgramError<TProgramErrorCode extends number>(
    error: unknown,
    transactionMessage: { instructions: Record<number, { programAddress: Address }> },
    programAddress: Address,
    code?: TProgramErrorCode,
): error is Readonly<{ context: Readonly<{ code: TProgramErrorCode }> }> &
    SolanaError<typeof SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM> {
    if (!isSolanaError(error, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM)) {
        return false;
    }
    const instructionProgramAddress = transactionMessage.instructions[error.context.index]?.programAddress;
    if (!instructionProgramAddress || instructionProgramAddress !== programAddress) {
        return false;
    }
    return typeof code === 'undefined' || error.context.code === code;
}
