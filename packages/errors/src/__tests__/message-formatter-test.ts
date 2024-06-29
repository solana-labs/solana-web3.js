import { SolanaErrorCode } from '../codes';
import { encodeContextObject } from '../context';
import { getErrorMessage } from '../message-formatter';
import * as MessagesModule from '../messages';

jest.mock('../context');
jest.mock('../messages', () => ({
    get SolanaErrorMessages() {
        return {};
    },
    __esModule: true,
}));

describe('getErrorMessage', () => {
    describe('in production mode', () => {
        beforeEach(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = false;
        });
        it('renders advice on where to decode a context-less error', () => {
            const message = getErrorMessage(
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                123,
            );
            expect(message).toBe('Solana error #123; Decode this error by running `npx @solana/errors decode -- 123`');
        });
        it('does not call the context encoder when the error has no context', () => {
            getErrorMessage(
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                123,
            );
            expect(encodeContextObject).not.toHaveBeenCalled();
        });
        it('does not call the context encoder when the error context has no keys', () => {
            const context = {};
            getErrorMessage(
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                123,
                context,
            );
            expect(encodeContextObject).not.toHaveBeenCalled();
        });
        it('calls the context encoder with the context', () => {
            const context = { foo: 'bar' };
            getErrorMessage(
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                123,
                context,
            );
            expect(encodeContextObject).toHaveBeenCalledWith(context);
        });
        it('renders advice on where to decode an error with encoded context', () => {
            jest.mocked(encodeContextObject).mockReturnValue('ENCODED_CONTEXT');
            const context = { foo: 'bar' };
            const message = getErrorMessage(123 as SolanaErrorCode, context);
            expect(message).toBe(
                "Solana error #123; Decode this error by running `npx @solana/errors decode -- 123 'ENCODED_CONTEXT'`",
            );
        });
        it('renders no encoded context in the decoding advice when the context has no keys', () => {
            jest.mocked(encodeContextObject).mockReturnValue('ENCODED_CONTEXT');
            const context = {};
            const message = getErrorMessage(123 as SolanaErrorCode, context);
            expect(message).toBe('Solana error #123; Decode this error by running `npx @solana/errors decode -- 123`');
        });
    });
    describe('in dev mode', () => {
        beforeEach(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = true;
        });
        it('renders static error messages', () => {
            const messagesSpy = jest.spyOn(MessagesModule, 'SolanaErrorMessages', 'get');
            messagesSpy.mockReturnValue({
                // @ts-expect-error Mock error config doesn't conform to exported config.
                123: 'static error message',
            });
            const message = getErrorMessage(
                // @ts-expect-error Mock error config doesn't conform to exported config.
                123,
            );
            expect(message).toBe('static error message');
        });
        it.each([
            {
                expected: "Something awful happened: 'bar'. How awful!",
                input: "Something $severity happened: '$foo'. How $severity!",
            },
            // Literal backslashes, escaped dollar signs
            {
                expected: 'How \\awful\\ is the $severity?',
                input: 'How \\\\$severity\\\\ is the \\$severity?',
            },
            // Variable at beginning of sequence
            { expected: 'awful times!', input: '$severity times!' },
            // Variable at end of sequence
            { expected: "Isn't it awful?", input: "Isn't it $severity?" },
            // Variable in middle of text sequence
            { expected: '~awful~', input: '~$severity~' },
            // Variable interpolation with no value in the lookup
            { expected: 'Is $thing a sandwich?', input: 'Is $thing a sandwich?' },
            // Variable that has, as a substring, some other value in the lookup
            { expected: '$fool', input: '$fool' },
            // Trick for butting a variable up against regular text
            { expected: 'barl', input: '$foo\\l' },
            // Escaped variable marker
            { expected: "It's the $severity, ya hear?", input: "It's the \\$severity, ya hear?" },
            // Single dollar sign
            { expected: ' $ ', input: ' $ ' },
            // Single dollar sign at start
            { expected: '$ ', input: '$ ' },
            // Single dollar sign at end
            { expected: ' $', input: ' $' },
            // Double dollar sign with legitimate variable name
            { expected: ' $bar ', input: ' $$foo ' },
            // Double dollar sign with legitimate variable name at start
            { expected: '$bar ', input: '$$foo ' },
            // Double dollar sign with legitimate variable name at end
            { expected: ' $bar', input: ' $$foo' },
            // Single escape sequence
            { expected: '  ', input: ' \\ ' },
            // Single escape sequence at start
            { expected: ' ', input: '\\ ' },
            // Single escape sequence at end
            { expected: ' ', input: ' \\' },
            // Double escape sequence
            { expected: ' \\ ', input: ' \\\\ ' },
            // Double escape sequence at start
            { expected: '\\ ', input: '\\\\ ' },
            // Double escape sequence at end
            { expected: ' \\', input: ' \\\\' },
            // Just text
            { expected: 'Some unencumbered text.', input: 'Some unencumbered text.' },
            // Empty string
            { expected: '', input: '' },
        ])('interpolates variables into the error message format string `"$input"`', ({ input, expected }) => {
            const messagesSpy = jest.spyOn(MessagesModule, 'SolanaErrorMessages', 'get');
            messagesSpy.mockReturnValue({
                // @ts-expect-error Mock error config doesn't conform to exported config.
                123: input,
            });
            const message = getErrorMessage(
                // @ts-expect-error Mock error context doesn't conform to exported context.
                123,
                { foo: 'bar', severity: 'awful' },
            );
            expect(message).toBe(expected);
        });
        it('interpolates a Uint8Array variable into a error message format string', () => {
            const messagesSpy = jest.spyOn(MessagesModule, 'SolanaErrorMessages', 'get');
            messagesSpy.mockReturnValue({
                // @ts-expect-error Mock error config doesn't conform to exported config.
                123: 'Here is some data: $data',
            });
            const message = getErrorMessage(
                // @ts-expect-error Mock error context doesn't conform to exported context.
                123,
                { data: new Uint8Array([1, 2, 3, 4]) },
            );
            expect(message).toBe('Here is some data: 1,2,3,4');
        });
        it('interpolates an undefined variable into a error message format string', () => {
            const messagesSpy = jest.spyOn(MessagesModule, 'SolanaErrorMessages', 'get');
            messagesSpy.mockReturnValue({
                // @ts-expect-error Mock error config doesn't conform to exported config.
                123: 'Here is a variable: $variable',
            });
            const message = getErrorMessage(
                // @ts-expect-error Mock error context doesn't conform to exported context.
                123,
                { variable: undefined },
            );
            expect(message).toBe('Here is a variable: undefined');
        });
    });
});
