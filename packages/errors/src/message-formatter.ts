import { SolanaErrorCode } from './codes';
import { SolanaErrorMessages } from './messages';

export function getHumanReadableErrorMessage<TErrorCode extends SolanaErrorCode>(
    code: TErrorCode,
    context: object = {},
): string {
    const messageFormatString = SolanaErrorMessages[code];
    const message = messageFormatString.replace(/(?<!\\)\$(\w+)/g, (substring, variableName) =>
        variableName in context ? `${context[variableName as keyof typeof context]}` : substring,
    );
    return message;
}

export function getErrorMessage<TErrorCode extends SolanaErrorCode>(code: TErrorCode, context: object = {}): string {
    if (__DEV__) {
        return getHumanReadableErrorMessage(code, context);
    } else {
        return `Solana error #${code}`;
    }
}
