import { SolanaErrorCode } from './codes';
import { SolanaErrorContext } from './context';
import { getErrorMessage } from './message-formatter';

export function isSolanaError<TErrorCode extends SolanaErrorCode>(
    e: unknown,
    code?: TErrorCode,
): e is SolanaError<TErrorCode> {
    const isSolanaError = e instanceof Error && e.name === 'SolanaError';
    if (isSolanaError) {
        if (code !== undefined) {
            return (e as SolanaError<TErrorCode>).context.__code === code;
        }
        return true;
    }
    return false;
}

type SolanaErrorCodedContext = Readonly<{
    [P in SolanaErrorCode]: (SolanaErrorContext[P] extends undefined ? object : SolanaErrorContext[P]) & {
        __code: P;
    };
}>;

export class SolanaError<TErrorCode extends SolanaErrorCode = SolanaErrorCode> extends Error {
    readonly context: SolanaErrorCodedContext[TErrorCode];
    constructor(
        ...[code, context]: SolanaErrorContext[TErrorCode] extends undefined
            ? [code: TErrorCode]
            : [code: TErrorCode, context: SolanaErrorContext[TErrorCode]]
    ) {
        const message = getErrorMessage(code, context);
        super(message);
        this.context = {
            __code: code,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            ...context,
        } as SolanaErrorCodedContext[TErrorCode];
        // This is necessary so that `isSolanaError()` can identify a `SolanaError` without having
        // to import the class for use in an `instanceof` check.
        this.name = 'SolanaError';
    }
}
