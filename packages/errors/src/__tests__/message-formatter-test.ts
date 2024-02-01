import { getErrorMessage } from '../message-formatter';
import * as MessagesModule from '../messages';

jest.mock('../messages', () => ({
    get SolanaErrorMessages() {
        return {};
    },
    __esModule: true,
}));

describe('getErrorMessage', () => {
    describe('in production mode', () => {
        beforeEach(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = false;
        });
        it('renders the code of the error', () => {
            const message = getErrorMessage(
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                123,
            );
            expect(message).toBe('Solana error #123');
        });
    });
    describe('in dev mode', () => {
        beforeEach(async () => {
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
    });
});
