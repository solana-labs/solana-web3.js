import { isSolanaError, SolanaError } from '../error';
import { getErrorMessage } from '../message-formatter';

jest.mock('../message-formatter');

describe('SolanaError', () => {
    let error123: SolanaError;
    beforeEach(() => {
        error123 = new SolanaError(
            123,
            // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
            { foo: 'bar' },
        );
    });
    it('exposes its error code', () => {
        expect(error123.context).toHaveProperty('__code', 123);
    });
    it('exposes its context', () => {
        expect(error123.context).toHaveProperty('foo', 'bar');
    });
    it('calls the message formatter with the code and context', () => {
        expect(getErrorMessage).toHaveBeenCalledWith(123, { foo: 'bar' });
    });
    it('sets its message to the output of the message formatter', async () => {
        expect.assertions(1);
        jest.mocked(getErrorMessage).mockReturnValue('o no');
        await jest.isolateModulesAsync(async () => {
            const SolanaErrorModule =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await import('../error');
            const error456 = new SolanaErrorModule.SolanaError(
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                456,
            );
            expect(error456).toHaveProperty('message', 'o no');
        });
    });
});

describe('isSolanaError()', () => {
    let error123: SolanaError;
    beforeEach(() => {
        error123 = new SolanaError(
            // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
            123,
        );
    });
    it('returns `true` for an instance of `SolanaError`', () => {
        expect(isSolanaError(error123)).toBe(true);
    });
    it('returns `false` for an instance of `Error`', () => {
        expect(isSolanaError(new Error('bad thing'))).toBe(false);
    });
    it('returns `true` when the error code matches', () => {
        expect(
            isSolanaError(
                error123,
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                123,
            ),
        ).toBe(true);
    });
    it('returns `false` when the error code does not match', () => {
        expect(
            isSolanaError(
                error123,
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                456,
            ),
        ).toBe(false);
    });
});
