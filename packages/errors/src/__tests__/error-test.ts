import { isSolanaError, SolanaError } from '../error';
import { getErrorMessage } from '../message-formatter';

jest.mock('../message-formatter');

describe('SolanaError', () => {
    describe('given an error with context', () => {
        let errorWithContext: SolanaError;
        beforeEach(() => {
            errorWithContext = new SolanaError(
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                123,
                { foo: 'bar' },
            );
        });
        it('exposes its error code', () => {
            expect(errorWithContext.context).toHaveProperty('__code', 123);
        });
        it('exposes its context', () => {
            expect(errorWithContext.context).toHaveProperty('foo', 'bar');
        });
        it('exposes no cause', () => {
            expect(errorWithContext.cause).toBeUndefined();
        });
        it('calls the message formatter with the code and context', () => {
            expect(getErrorMessage).toHaveBeenCalledWith(123, { foo: 'bar' });
        });
    });
    describe('given an error with no context', () => {
        beforeEach(() => {
            new SolanaError(
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                123,
                undefined,
            );
        });
        it('calls the message formatter with undefined context', () => {
            expect(getErrorMessage).toHaveBeenCalledWith(123, undefined);
        });
    });
    describe('given an error with a cause', () => {
        let errorWithCause: SolanaError;
        let cause: unknown;
        beforeEach(() => {
            cause = {};
            errorWithCause = new SolanaError(
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                123,
                { cause },
            );
        });
        it('exposes its cause', () => {
            expect(errorWithCause.cause).toBe(cause);
        });
    });
    describe.each(['cause'])('given an error with only the `%s` property from `ErrorOptions` present', propName => {
        let errorOptionValue: unknown;
        let errorWithOption: SolanaError;
        beforeEach(() => {
            errorOptionValue = Symbol();
            errorWithOption = new SolanaError(
                // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
                123,
                { [propName]: errorOptionValue },
            );
        });
        it('omits the error option from its context', () => {
            expect(errorWithOption.context).not.toHaveProperty(propName);
        });
        it('calls the message formatter with the error option omitted', () => {
            expect(getErrorMessage).toHaveBeenCalledWith(
                123,
                expect.not.objectContaining({ [propName]: errorOptionValue }),
            );
        });
    });
    it('sets its message to the output of the message formatter', async () => {
        expect.assertions(1);
        jest.mocked(getErrorMessage).mockReturnValue('o no');
        await jest.isolateModulesAsync(async () => {
            const SolanaErrorModule =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await import('../error');
            // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
            const error456 = new SolanaErrorModule.SolanaError(456);
            expect(error456).toHaveProperty('message', 'o no');
        });
    });
});

describe('isSolanaError()', () => {
    let error123: SolanaError;
    beforeEach(() => {
        // @ts-expect-error Mock error codes don't conform to `SolanaErrorCode`
        error123 = new SolanaError(123);
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
