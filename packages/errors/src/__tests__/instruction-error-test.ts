import {
    SOLANA_ERROR__INSTRUCTION_ERROR__BORSH_IO_ERROR,
    SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
    SOLANA_ERROR__INSTRUCTION_ERROR__UNKNOWN,
    SolanaErrorCode,
} from '../codes';
import { SolanaError } from '../error';
import { getSolanaErrorFromInstructionError } from '../instruction-error';

describe('getSolanaErrorFromInstructionError', () => {
    it.each([
        ['GenericError', 4615001],
        ['InvalidArgument', 4615002],
        ['InvalidInstructionData', 4615003],
        ['InvalidAccountData', 4615004],
        ['AccountDataTooSmall', 4615005],
        ['InsufficientFunds', 4615006],
        ['IncorrectProgramId', 4615007],
        ['MissingRequiredSignature', 4615008],
        ['AccountAlreadyInitialized', 4615009],
        ['UninitializedAccount', 4615010],
        ['UnbalancedInstruction', 4615011],
        ['ModifiedProgramId', 4615012],
        ['ExternalAccountLamportSpend', 4615013],
        ['ExternalAccountDataModified', 4615014],
        ['ReadonlyLamportChange', 4615015],
        ['ReadonlyDataModified', 4615016],
        ['DuplicateAccountIndex', 4615017],
        ['ExecutableModified', 4615018],
        ['RentEpochModified', 4615019],
        ['NotEnoughAccountKeys', 4615020],
        ['AccountDataSizeChanged', 4615021],
        ['AccountNotExecutable', 4615022],
        ['AccountBorrowFailed', 4615023],
        ['AccountBorrowOutstanding', 4615024],
        ['DuplicateAccountOutOfSync', 4615025],
        ['InvalidError', 4615027],
        ['ExecutableDataModified', 4615028],
        ['ExecutableLamportChange', 4615029],
        ['ExecutableAccountNotRentExempt', 4615030],
        ['UnsupportedProgramId', 4615031],
        ['CallDepth', 4615032],
        ['MissingAccount', 4615033],
        ['ReentrancyNotAllowed', 4615034],
        ['MaxSeedLengthExceeded', 4615035],
        ['InvalidSeeds', 4615036],
        ['InvalidRealloc', 4615037],
        ['ComputationalBudgetExceeded', 4615038],
        ['PrivilegeEscalation', 4615039],
        ['ProgramEnvironmentSetupFailure', 4615040],
        ['ProgramFailedToComplete', 4615041],
        ['ProgramFailedToCompile', 4615042],
        ['Immutable', 4615043],
        ['IncorrectAuthority', 4615044],
        ['AccountNotRentExempt', 4615046],
        ['InvalidAccountOwner', 4615047],
        ['ArithmeticOverflow', 4615048],
        ['UnsupportedSysvar', 4615049],
        ['IllegalOwner', 4615050],
        ['MaxAccountsDataAllocationsExceeded', 4615051],
        ['MaxAccountsExceeded', 4615052],
        ['MaxInstructionTraceLengthExceeded', 4615053],
        ['BuiltinProgramsMustConsumeComputeUnits', 4615054],
    ])('produces the correct `SolanaError` for a `%s` error', (transactionError, expectedCode) => {
        const error = getSolanaErrorFromInstructionError(123, transactionError);
        expect(error).toEqual(new SolanaError(expectedCode as SolanaErrorCode, { index: 123 }));
    });
    it('produces the correct `SolanaError` for a `Custom` error', () => {
        const error = getSolanaErrorFromInstructionError(123, { Custom: 789 });
        expect(error).toEqual(
            new SolanaError(SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM, {
                code: 789,
                index: 123,
            }),
        );
    });
    it('produces the correct `SolanaError` for a `BorshIoError` error', () => {
        const error = getSolanaErrorFromInstructionError(123, { BorshIoError: 'abc' });
        expect(error).toEqual(
            new SolanaError(SOLANA_ERROR__INSTRUCTION_ERROR__BORSH_IO_ERROR, {
                encodedData: 'abc',
                index: 123,
            }),
        );
    });
    it("returns the unknown error when encountering an enum name that's missing from the map", () => {
        const error = getSolanaErrorFromInstructionError(123, 'ThisDoesNotExist');
        expect(error).toEqual(
            new SolanaError(SOLANA_ERROR__INSTRUCTION_ERROR__UNKNOWN, {
                errorName: 'ThisDoesNotExist',
                index: 123,
            }),
        );
    });
    it("returns the unknown error when encountering an enum struct that's missing from the map", () => {
        const expectedContext = {} as const;
        const error = getSolanaErrorFromInstructionError(123, { ThisDoesNotExist: expectedContext });
        expect(error).toEqual(
            new SolanaError(SOLANA_ERROR__INSTRUCTION_ERROR__UNKNOWN, {
                errorName: 'ThisDoesNotExist',
                index: 123,
                instructionErrorContext: expectedContext,
            }),
        );
    });
});
