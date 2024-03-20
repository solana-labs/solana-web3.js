import { SolanaErrorCode } from './codes.js';
import { SolanaErrorMessages } from './messages.js';

function encodeValue(value: unknown): string {
    if (Array.isArray(value)) {
        return (
            /* "[" */ '%5B' +
            value
                .map(element =>
                    typeof element === 'string'
                        ? encodeURIComponent(`"${element.replace(/"/g, '\\"')}"`)
                        : encodeValue(element),
                )
                .join(/* ", " */ '%2C%20') +
            /* "]" */ '%5D'
        );
    } else if (typeof value === 'bigint') {
        return `${value}n`;
    } else {
        return encodeURIComponent(
            String(
                value != null && Object.getPrototypeOf(value) === null
                    ? // Plain objects with no protoype don't have a `toString` method.
                      // Convert them before stringifying them.
                      { ...(value as object) }
                    : value,
            ),
        );
    }
}

function encodeObjectContextEntry([key, value]: [string, unknown]): `${typeof key}=${string}` {
    return `${key}=${encodeValue(value)}`;
}

function encodeContextObject(context: object) {
    return Object.entries(context).map(encodeObjectContextEntry).join('&');
}

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
        let decodingAdviceMessage = `Solana error #${code}; Decode this error by running \`npx @solana/errors decode ${code}`;
        if (Object.keys(context).length) {
            /**
             * DANGER: Be sure that the shell command is escaped in such a way that makes it
             *         impossible for someone to craft malicious context values that would result in
             *         an exploit against anyone who bindly copy/pastes it into their terminal.
             */
            decodingAdviceMessage += ` $"${encodeContextObject(context)}"`;
        }
        return `${decodingAdviceMessage}\``;
    }
}
