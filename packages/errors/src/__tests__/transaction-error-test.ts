import {
    SOLANA_ERROR__TRANSACTION_ERROR__DUPLICATE_INSTRUCTION,
    SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_RENT,
    SOLANA_ERROR__TRANSACTION_ERROR__PROGRAM_EXECUTION_TEMPORARILY_RESTRICTED,
    SOLANA_ERROR__TRANSACTION_ERROR__UNKNOWN,
    SolanaErrorCode,
} from '../codes';
import { SolanaError } from '../error';
import { getSolanaErrorFromInstructionError } from '../instruction-error';
import { getSolanaErrorFromTransactionError } from '../transaction-error';

jest.mock('../instruction-error.ts');

describe('getSolanaErrorFromTransactionError', () => {
    it.each([
        ['AccountInUse', 7050001],
        ['AccountLoadedTwice', 7050002],
        ['AccountNotFound', 7050003],
        ['ProgramAccountNotFound', 7050004],
        ['InsufficientFundsForFee', 7050005],
        ['InvalidAccountForFee', 7050006],
        ['AlreadyProcessed', 7050007],
        ['BlockhashNotFound', 7050008],
        ['CallChainTooDeep', 7050009],
        ['MissingSignatureForFee', 7050010],
        ['InvalidAccountIndex', 7050011],
        ['SignatureFailure', 7050012],
        ['InvalidProgramForExecution', 7050013],
        ['SanitizeFailure', 7050014],
        ['ClusterMaintenance', 7050015],
        ['AccountBorrowOutstanding', 7050016],
        ['WouldExceedMaxBlockCostLimit', 7050017],
        ['UnsupportedVersion', 7050018],
        ['InvalidWritableAccount', 7050019],
        ['WouldExceedMaxAccountCostLimit', 7050020],
        ['WouldExceedAccountDataBlockLimit', 7050021],
        ['TooManyAccountLocks', 7050022],
        ['AddressLookupTableNotFound', 7050023],
        ['InvalidAddressLookupTableOwner', 7050024],
        ['InvalidAddressLookupTableData', 7050025],
        ['InvalidAddressLookupTableIndex', 7050026],
        ['InvalidRentPayingAccount', 7050027],
        ['WouldExceedMaxVoteCostLimit', 7050028],
        ['WouldExceedAccountDataTotalLimit', 7050029],
        ['MaxLoadedAccountsDataSizeExceeded', 7050032],
        ['InvalidLoadedAccountsDataSizeLimit', 7050033],
        ['ResanitizationNeeded', 7050034],
        ['UnbalancedTransaction', 7050036],
    ])('produces the correct `SolanaError` for a `%s` error', (transactionError, expectedCode) => {
        const error = getSolanaErrorFromTransactionError(transactionError);
        expect(error).toEqual(new SolanaError(expectedCode as SolanaErrorCode, undefined));
    });
    it('produces the correct `SolanaError` for a `DuplicateInstruction` error', () => {
        const error = getSolanaErrorFromTransactionError({ DuplicateInstruction: 1 });
        expect(error).toEqual(
            new SolanaError(SOLANA_ERROR__TRANSACTION_ERROR__DUPLICATE_INSTRUCTION, {
                index: 1,
            }),
        );
    });
    it('produces the correct `SolanaError` for a `InsufficientFundsForRent` error', () => {
        const error = getSolanaErrorFromTransactionError({ InsufficientFundsForRent: { account_index: 1 } });
        expect(error).toEqual(
            new SolanaError(SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_RENT, {
                accountIndex: 1,
            }),
        );
    });
    it('produces the correct `SolanaError` for a `ProgramExecutionTemporarilyRestricted` error', () => {
        const error = getSolanaErrorFromTransactionError({
            ProgramExecutionTemporarilyRestricted: { account_index: 1 },
        });
        expect(error).toEqual(
            new SolanaError(SOLANA_ERROR__TRANSACTION_ERROR__PROGRAM_EXECUTION_TEMPORARILY_RESTRICTED, {
                accountIndex: 1,
            }),
        );
    });
    it("returns the unknown error when encountering an enum name that's missing from the map", () => {
        const error = getSolanaErrorFromTransactionError('ThisDoesNotExist');
        expect(error).toEqual(
            new SolanaError(SOLANA_ERROR__TRANSACTION_ERROR__UNKNOWN, {
                errorName: 'ThisDoesNotExist',
            }),
        );
    });
    it("returns the unknown error when encountering an enum struct that's missing from the map", () => {
        const expectedContext = {} as const;
        const error = getSolanaErrorFromTransactionError({ ThisDoesNotExist: expectedContext });
        expect(error).toEqual(
            new SolanaError(SOLANA_ERROR__TRANSACTION_ERROR__UNKNOWN, {
                errorName: 'ThisDoesNotExist',
                transactionErrorContext: expectedContext,
            }),
        );
    });
    it('delegates `InstructionError` to the instruction error getter', () => {
        const instructionError = Symbol();
        const mockErrorResult = Symbol() as unknown as SolanaError;
        jest.mocked(getSolanaErrorFromInstructionError).mockReturnValue(mockErrorResult);
        const error = getSolanaErrorFromTransactionError({ InstructionError: [123, instructionError] });
        expect(getSolanaErrorFromInstructionError).toHaveBeenCalledWith(123, instructionError);
        expect(error).toBe(mockErrorResult);
    });
});
