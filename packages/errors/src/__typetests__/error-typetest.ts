import * as SolanaErrorCodeModule from '../codes';
import { SolanaErrorCode } from '../codes';
import { SolanaErrorContext } from '../context';
import { isSolanaError, SolanaError } from '../error';

const { SOLANA_ERROR__TRANSACTION_SIGNATURE_NOT_COMPUTABLE, SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES } =
    SolanaErrorCodeModule;

// If this line raises a type error, you might have forgotten to add a new error to the
// `SolanaErrorCode` union in `src/codes.ts`.
Object.values(SolanaErrorCodeModule) satisfies SolanaErrorCode[];

const transactionMissingSignaturesError = new SolanaError(SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES, {
    addresses: ['123', '456'],
});

transactionMissingSignaturesError.context.__code satisfies typeof SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES;
// @ts-expect-error Wrong error code.
transactionMissingSignaturesError.context.__code satisfies typeof SOLANA_ERROR__TRANSACTION_SIGNATURE_NOT_COMPUTABLE;

transactionMissingSignaturesError.context satisfies SolanaErrorContext[typeof SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES];
// @ts-expect-error Non existent context property.
transactionMissingSignaturesError.context.feePayer;

new SolanaError(SOLANA_ERROR__TRANSACTION_SIGNATURE_NOT_COMPUTABLE);
// @ts-expect-error Missing context property (`addresses`)
new SolanaError(SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES);

const unknownError = null as unknown as SolanaError;
if (unknownError.context.__code === SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES) {
    unknownError.context satisfies SolanaErrorContext[typeof SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES];
    // @ts-expect-error Context belongs to another error code
    unknownError.context satisfies SolanaErrorContext[typeof SOLANA_ERROR__TRANSACTION_SIGNATURE_NOT_COMPUTABLE];
}

const e = null as unknown;
if (isSolanaError(e)) {
    e.context satisfies Readonly<{ __code: SolanaErrorCode }>;
}
if (isSolanaError(e, SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES)) {
    e.context satisfies SolanaErrorContext[typeof SOLANA_ERROR__TRANSACTION_MISSING_SIGNATURES];
    // @ts-expect-error Context belongs to another error code
    e.context satisfies SolanaErrorContext[typeof SOLANA_ERROR__TRANSACTION_SIGNATURE_NOT_COMPUTABLE];
}
