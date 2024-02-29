import { SolanaErrorCode } from './codes';
import { SolanaErrorContext } from './context';
import { SolanaError } from './error';

/**
 * How to add an error when an entry is added to the RPC `TransactionError` enum:
 *
 *   1. Follow the instructions in `./codes.ts` to add a corresponding Solana error code
 *   2. Add the `TransactionError` enum name in the same order as it appears in `./codes.ts`
 *   3. Add the new error name/code mapping to `./__tests__/transaction-error-test.ts`
 */
const ORDERED_ERROR_NAMES = [
    // Keep synced with RPC source: https://github.com/anza-xyz/agave/blob/master/sdk/src/transaction/error.rs
    // If this list ever gets too large, consider implementing a compression strategy like this:
    // https://gist.github.com/steveluscher/aaa7cbbb5433b1197983908a40860c47
    'AccountInUse',
    'AccountLoadedTwice',
    'AccountNotFound',
    'ProgramAccountNotFound',
    'InsufficientFundsForFee',
    'InvalidAccountForFee',
    'AlreadyProcessed',
    'BlockhashNotFound',
    // `InstructionError` intentionally omitted
    'CallChainTooDeep',
    'MissingSignatureForFee',
    'InvalidAccountIndex',
    'SignatureFailure',
    'InvalidProgramForExecution',
    'SanitizeFailure',
    'ClusterMaintenance',
    'AccountBorrowOutstanding',
    'WouldExceedMaxBlockCostLimit',
    'UnsupportedVersion',
    'InvalidWritableAccount',
    'WouldExceedMaxAccountCostLimit',
    'WouldExceedAccountDataBlockLimit',
    'TooManyAccountLocks',
    'AddressLookupTableNotFound',
    'InvalidAddressLookupTableOwner',
    'InvalidAddressLookupTableData',
    'InvalidAddressLookupTableIndex',
    'InvalidRentPayingAccount',
    'WouldExceedMaxVoteCostLimit',
    'WouldExceedAccountDataTotalLimit',
    'DuplicateInstruction',
    'InsufficientFundsForRent',
    'MaxLoadedAccountsDataSizeExceeded',
    'InvalidLoadedAccountsDataSizeLimit',
    'ResanitizationNeeded',
    'ProgramExecutionTemporarilyRestricted',
    'UnbalancedTransaction',
];

export function getSolanaErrorFromTransactionError(transactionError: string | { [key: string]: unknown }): SolanaError {
    let errorName;
    let transactionErrorContext;
    if (typeof transactionError === 'string') {
        errorName = transactionError;
    } else {
        errorName = Object.keys(transactionError)[0];
        transactionErrorContext = transactionError[errorName];
    }
    const codeOffset = ORDERED_ERROR_NAMES.indexOf(errorName);
    const errorCode =
        /**
         * Oh, hello. You might wonder what in tarnation is going on here. Allow us to explain.
         *
         * One of the goals of `@solana/errors` is to allow errors that are not interesting to your
         * application to shake out of your app bundle in production. This means that we must never
         * export large hardcoded maps of error codes/messages.
         *
         * Unfortunately, where transaction errors from the RPC are concerned, we have no choice but
         * to keep a map between the RPC `TransactionError` enum name and its corresponding
         * `SolanaError` code. In the interest of implementing that map in as few bytes of source
         * code as possible, we do the following:
         *
         *   1. Reserve sequential error codes for `TransactionError` in the range [7050000-7050999]
         *   2. Hardcode the list of `TransactionError` enum names in that same order
         *   3. Match the transaction error name from the RPC with its index in that list, and
         *      reconstruct the `SolanaError` code by adding 7050001 to that index
         */
        (7050001 + codeOffset) as SolanaErrorCode;
    let errorContext: SolanaErrorContext[SolanaErrorCode];
    if (codeOffset === -1) {
        errorContext = {
            errorName,
            ...(transactionErrorContext !== undefined ? { transactionErrorContext } : null),
        };
    } else if (codeOffset === 29 /* DuplicateInstruction */) {
        errorContext = {
            index: transactionErrorContext as number,
        };
    } else if (
        codeOffset === 30 /* InsufficientFundsForRent */ ||
        codeOffset === 34 /* ProgramExecutionTemporarilyRestricted */
    ) {
        errorContext = {
            accountIndex: (transactionErrorContext as { account_index: number }).account_index,
        };
    }
    const err = new SolanaError(errorCode, errorContext);
    if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(err, getSolanaErrorFromTransactionError);
    }
    return err;
}
