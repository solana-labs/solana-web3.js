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
        it('interpolates variables into a error message format string', () => {
            const messagesSpy = jest.spyOn(MessagesModule, 'SolanaErrorMessages', 'get');
            messagesSpy.mockReturnValue({
                // @ts-expect-error Mock error config doesn't conform to exported config.
                123: "Something $severity happened: '$foo'. How $severity!",
            });
            const message = getErrorMessage(
                // @ts-expect-error Mock error context doesn't conform to exported context.
                123,
                { foo: 'bar', severity: 'awful' },
            );
            expect(message).toBe("Something awful happened: 'bar'. How awful!");
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
