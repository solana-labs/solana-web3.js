import { getErrorMessage } from '../message-formatter.js';
import * as MessagesModule from '../messages.js';

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
        it('renders advice on where to decode a detail-less error', () => {
            const message = getErrorMessage(
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                123,
            );
            expect(message).toBe('Solana error #123; Decode this error by running `npx @solana/errors decode 123`');
        });
        it('renders advice on where to decode an error with sanitized context', async () => {
            expect.assertions(1);
            const message = getErrorMessage(
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                123,
                {
                    a: 1n,
                    b: '"bar"',
                    c: "'baz'",
                    d: '!$&ymbo;s\\',
                    e: [1, ["'2a'", '"2b"', '2c'], 3],
                    f: Symbol('hi'),
                    g: { foo: 'bar' },
                    h: new URL('http://anza.xyz'),
                    i: (
                        (await crypto.subtle.generateKey('Ed25519', false /* extractable */, [
                            'sign',
                            'verify',
                        ])) as CryptoKeyPair
                    ).privateKey,
                    j: Object.create(null),
                    k: null,
                    l: undefined,
                },
            );
            expect(message).toBe(
                'Solana error #123; Decode this error by running `npx @solana/errors decode 123 $"' +
                    'a=1n' +
                    '&b=%22bar%22' +
                    "&c='baz'" +
                    '&d=!%24%26ymbo%3Bs%5C' +
                    "&e=%5B1%2C%20%5B%22'2a'%22%2C%20%22%5C%222b%5C%22%22%2C%20%222c%22%5D%2C%203%5D" +
                    '&f=Symbol(hi)' +
                    '&g=%5Bobject%20Object%5D' +
                    '&h=http%3A%2F%2Fanza.xyz%2F' +
                    '&i=%5Bobject%20CryptoKey%5D' +
                    '&j=%5Bobject%20Object%5D' +
                    '&k=null' +
                    '&l=undefined' +
                    '"`',
            );
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
