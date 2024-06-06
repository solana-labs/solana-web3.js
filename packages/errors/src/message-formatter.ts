import { SolanaErrorCode } from './codes';
import { encodeContextObject } from './context';
import { SolanaErrorMessages } from './messages';

const enum StateType {
    EscapeSequence,
    Text,
    Variable,
}
type State = Readonly<{
    [START_INDEX]: number;
    [TYPE]: StateType;
}>;
const START_INDEX = 'i';
const TYPE = 't';

export function getHumanReadableErrorMessage<TErrorCode extends SolanaErrorCode>(
    code: TErrorCode,
    context: object = {},
): string {
    const messageFormatString = SolanaErrorMessages[code];
    if (messageFormatString.length === 0) {
        return '';
    }
    let state: State;
    function commitStateUpTo(endIndex?: number) {
        if (state[TYPE] === StateType.Variable) {
            const variableName = messageFormatString.slice(state[START_INDEX] + 1, endIndex);
            fragments.push(
                variableName in context ? `${context[variableName as keyof typeof context]}` : `$${variableName}`,
            );
        } else if (state[TYPE] === StateType.Text) {
            fragments.push(messageFormatString.slice(state[START_INDEX], endIndex));
        }
    }
    const fragments: string[] = [];
    messageFormatString.split('').forEach((char, ii) => {
        if (ii === 0) {
            state = {
                [START_INDEX]: 0,
                [TYPE]:
                    messageFormatString[0] === '\\'
                        ? StateType.EscapeSequence
                        : messageFormatString[0] === '$'
                          ? StateType.Variable
                          : StateType.Text,
            };
            return;
        }
        let nextState;
        switch (state[TYPE]) {
            case StateType.EscapeSequence:
                nextState = { [START_INDEX]: ii, [TYPE]: StateType.Text };
                break;
            case StateType.Text:
                if (char === '\\') {
                    nextState = { [START_INDEX]: ii, [TYPE]: StateType.EscapeSequence };
                } else if (char === '$') {
                    nextState = { [START_INDEX]: ii, [TYPE]: StateType.Variable };
                }
                break;
            case StateType.Variable:
                if (char === '\\') {
                    nextState = { [START_INDEX]: ii, [TYPE]: StateType.EscapeSequence };
                } else if (char === '$') {
                    nextState = { [START_INDEX]: ii, [TYPE]: StateType.Variable };
                } else if (!char.match(/\w/)) {
                    nextState = { [START_INDEX]: ii, [TYPE]: StateType.Text };
                }
                break;
        }
        if (nextState) {
            if (state !== nextState) {
                commitStateUpTo(ii);
            }
            state = nextState;
        }
    });
    commitStateUpTo();
    return fragments.join('');
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
