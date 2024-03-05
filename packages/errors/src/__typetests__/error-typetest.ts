import * as SolanaErrorCodeModule from '../codes';
import { SolanaErrorCode } from '../codes';
import { SolanaErrorContext } from '../context';
import { isSolanaError, SolanaError } from '../error';

const { SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING, SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING } =
    SolanaErrorCodeModule;

// If this line raises a type error, you might have forgotten to add a new error to the
// `SolanaErrorCode` union in `src/codes.ts`.
Object.values(SolanaErrorCodeModule) satisfies SolanaErrorCode[];

const transactionMissingSignaturesError = new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
    addresses: ['123', '456'],
});

{
    const code = transactionMissingSignaturesError.context.__code;
    code satisfies typeof SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING;
    // @ts-expect-error Wrong error code.
    code satisfies typeof SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING;
}

transactionMissingSignaturesError.context satisfies SolanaErrorContext[typeof SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING];
// @ts-expect-error Non existent context property.
transactionMissingSignaturesError.context.feePayer;

new SolanaError(SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING);
// @ts-expect-error Missing context property (`addresses`)
new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING);

const unknownError = null as unknown as SolanaError;
if (unknownError.context.__code === SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING) {
    unknownError.context satisfies SolanaErrorContext[typeof SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING];
    // @ts-expect-error Context belongs to another error code
    unknownError.context satisfies SolanaErrorContext[typeof SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING];
}

const e = null as unknown;
if (isSolanaError(e)) {
    e.context satisfies Readonly<{ __code: SolanaErrorCode }>;
}
if (isSolanaError(e, SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING)) {
    e.context satisfies SolanaErrorContext[typeof SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING];
    // @ts-expect-error Context belongs to another error code
    e.context satisfies SolanaErrorContext[typeof SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING];
}

// `SolanaErrorContext` must not contain any keys reserved by `ErrorOptions` (eg. `cause`)
null as unknown as SolanaErrorContext satisfies {
    [Code in keyof SolanaErrorContext]: SolanaErrorContext[Code] extends undefined
        ? undefined
        : {
              [PP in keyof SolanaErrorContext[Code]]: PP extends keyof ErrorOptions
                  ? never
                  : SolanaErrorContext[Code][PP];
          };
};
