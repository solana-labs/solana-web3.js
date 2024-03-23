import { SolanaErrorCode } from './codes';
import { encodeContextObject } from './context';
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
        let decodingAdviceMessage = `Solana error #${code}; Decode this error by running \`npx @solana/errors decode -- ${code}`;
        if (Object.keys(context).length) {
            /**
             * DANGER: Be sure that the shell command is escaped in such a way that makes it
             *         impossible for someone to craft malicious context values that would result in
             *         an exploit against anyone who bindly copy/pastes it into their terminal.
             */
            decodingAdviceMessage += ` '${encodeContextObject(context)}'`;
        }
        return `${decodingAdviceMessage}\``;
    }
}
