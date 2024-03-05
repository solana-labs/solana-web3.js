import {
    SOLANA_ERROR__INSTRUCTION_ERROR__BORSH_IO_ERROR,
    SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
    SOLANA_ERROR__INSTRUCTION_ERROR__UNKNOWN,
} from './codes';
import { SolanaError } from './error';
import { getSolanaErrorFromRpcError } from './rpc-enum-errors';

const ORDERED_ERROR_NAMES = [
    // Keep synced with RPC source: https://github.com/anza-xyz/agave/blob/master/sdk/program/src/instruction.rs
    // If this list ever gets too large, consider implementing a compression strategy like this:
    // https://gist.github.com/steveluscher/aaa7cbbb5433b1197983908a40860c47
    'GenericError',
    'InvalidArgument',
    'InvalidInstructionData',
    'InvalidAccountData',
    'AccountDataTooSmall',
    'InsufficientFunds',
    'IncorrectProgramId',
    'MissingRequiredSignature',
    'AccountAlreadyInitialized',
    'UninitializedAccount',
    'UnbalancedInstruction',
    'ModifiedProgramId',
    'ExternalAccountLamportSpend',
    'ExternalAccountDataModified',
    'ReadonlyLamportChange',
    'ReadonlyDataModified',
    'DuplicateAccountIndex',
    'ExecutableModified',
    'RentEpochModified',
    'NotEnoughAccountKeys',
    'AccountDataSizeChanged',
    'AccountNotExecutable',
    'AccountBorrowFailed',
    'AccountBorrowOutstanding',
    'DuplicateAccountOutOfSync',
    'Custom',
    'InvalidError',
    'ExecutableDataModified',
    'ExecutableLamportChange',
    'ExecutableAccountNotRentExempt',
    'UnsupportedProgramId',
    'CallDepth',
    'MissingAccount',
    'ReentrancyNotAllowed',
    'MaxSeedLengthExceeded',
    'InvalidSeeds',
    'InvalidRealloc',
    'ComputationalBudgetExceeded',
    'PrivilegeEscalation',
    'ProgramEnvironmentSetupFailure',
    'ProgramFailedToComplete',
    'ProgramFailedToCompile',
    'Immutable',
    'IncorrectAuthority',
    'BorshIoError',
    'AccountNotRentExempt',
    'InvalidAccountOwner',
    'ArithmeticOverflow',
    'UnsupportedSysvar',
    'IllegalOwner',
    'MaxAccountsDataAllocationsExceeded',
    'MaxAccountsExceeded',
    'MaxInstructionTraceLengthExceeded',
    'BuiltinProgramsMustConsumeComputeUnits',
];

export function getSolanaErrorFromInstructionError(
    index: number,
    instructionError: string | { [key: string]: unknown },
): SolanaError {
    return getSolanaErrorFromRpcError(
        {
            errorCodeBaseOffset: 4615001,
            getErrorContext(errorCode, rpcErrorName, rpcErrorContext) {
                if (errorCode === SOLANA_ERROR__INSTRUCTION_ERROR__UNKNOWN) {
                    return {
                        errorName: rpcErrorName,
                        index,
                        ...(rpcErrorContext !== undefined ? { instructionErrorContext: rpcErrorContext } : null),
                    };
                } else if (errorCode === SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM) {
                    return {
                        code: rpcErrorContext as number,
                        index,
                    };
                } else if (errorCode === SOLANA_ERROR__INSTRUCTION_ERROR__BORSH_IO_ERROR) {
                    return {
                        encodedData: rpcErrorContext as string,
                        index,
                    };
                }
                return { index };
            },
            orderedErrorNames: ORDERED_ERROR_NAMES,
            rpcEnumError: instructionError,
        },
        getSolanaErrorFromInstructionError,
    );
}
