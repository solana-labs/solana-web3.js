import '@solana/test-matchers/toBeFrozenObject';

import { createInterruptibleAsyncIterator, InterruptibleAsyncIterator } from '../interruptible';

describe('createInterruptibleAsyncIterator', () => {
    let innerIterator: AsyncIterator<void>;
    let mockInnerNext: jest.Mock<Promise<IteratorResult<void>>>;
    beforeEach(() => {
        mockInnerNext = jest.fn().mockResolvedValue({ done: false, value: 42 });
        innerIterator = {
            next: mockInnerNext,
        };
    });
    it('does not poll the inner iterator upon construction', () => {
        createInterruptibleAsyncIterator(innerIterator);
        expect(mockInnerNext).not.toHaveBeenCalled();
    });
    it('omits non-iterator properties from the original iterator', () => {
        function reset() {}
        const iterator = createInterruptibleAsyncIterator({ ...innerIterator, reset });
        expect(iterator).not.toHaveProperty('reset', reset);
    });
    it('returns a frozen object', () => {
        const iterator = createInterruptibleAsyncIterator(innerIterator);
        expect(iterator).toBeFrozenObject();
    });
});

describe('an interruptible `AsyncIterator`', () => {
    let interruptibleIterator: InterruptibleAsyncIterator<42, 'return', 'next'>;
    let mockInnerNext: jest.Mock<Promise<IteratorResult<42, 'return'>>, ['next']>;
    beforeEach(() => {
        mockInnerNext = jest.fn().mockResolvedValue({ done: false, value: 42 });
        interruptibleIterator = createInterruptibleAsyncIterator({
            next: mockInnerNext,
        });
    });
    it('forwards calls to `next()` to the inner iterator', () => {
        interruptibleIterator.next('next');
        expect(mockInnerNext).toHaveBeenCalledWith('next');
    });
    describe('given that the next value will reject on the next call', () => {
        beforeEach(() => {
            mockInnerNext.mockRejectedValueOnce('o no');
        });
        it('rejects with that value when `next()` is called', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.next('next')).rejects.toBe('o no');
        });
        describe('after the call to `next()` rejects', () => {
            beforeEach(async () => {
                await interruptibleIterator.next('next').catch(() => {});
            });
            it('does not forward subsequent calls to `next()` to the inner iterator', () => {
                mockInnerNext.mockClear();
                interruptibleIterator.next('next');
                expect(mockInnerNext).not.toHaveBeenCalled();
            });
            it('returns a terminal result on subsequent calls to `next()`', async () => {
                expect.assertions(1);
                await expect(interruptibleIterator.next('next')).resolves.toStrictEqual({
                    done: true,
                    value: undefined,
                });
            });
        });
    });
    describe('given that the next value will resolve', () => {
        let expectedResult: IteratorYieldResult<42>;
        beforeEach(() => {
            expectedResult = { done: false, value: 42 };
            mockInnerNext.mockResolvedValue(expectedResult);
        });
        it('resolves to that exact result when `next()` is called', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.next('next')).resolves.toBe(expectedResult);
        });
    });
    describe('given that the next value will resolve a terminal result', () => {
        let terminalResult: IteratorReturnResult<'return'>;
        beforeEach(() => {
            terminalResult = { done: true, value: 'return' };
            mockInnerNext.mockResolvedValue(terminalResult);
        });
        it('resolves to that result when `next()` is called', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.next('next')).resolves.toBe(terminalResult);
        });
        describe('after a successful call to `next()`', () => {
            beforeEach(async () => {
                await interruptibleIterator.next('next');
            });
            it('does not forward subsequent calls to `next()` to the inner iterator`', () => {
                mockInnerNext.mockClear();
                interruptibleIterator.next('next');
                expect(mockInnerNext).not.toHaveBeenCalled();
            });
            it('resolves subsequent calls to `next()` with something that equals the terminal result', async () => {
                expect.assertions(1);
                await expect(interruptibleIterator.next('next')).resolves.toStrictEqual(terminalResult);
            });
            it('resolves subsequent calls to `next()` with something that is not exactly the terminal result', async () => {
                expect.assertions(1);
                await expect(interruptibleIterator.next('next')).resolves.not.toBe(terminalResult);
            });
        });
    });
});

describe('an interruptible `AsyncIterator` whose inner iterator implements `return()`', () => {
    let interruptibleIterator: InterruptibleAsyncIterator<42, 'return', 'next'>;
    let mockInnerNext: jest.Mock<Promise<IteratorResult<42, 'return'>>, ['next']>;
    let mockInnerReturn: jest.Mock<Promise<IteratorResult<42, 'return'>>, ['return']>;
    beforeEach(() => {
        mockInnerNext = jest.fn().mockResolvedValue({ done: false, value: 42 });
        mockInnerReturn = jest.fn().mockResolvedValue({ done: true, value: 'return' });
        interruptibleIterator = createInterruptibleAsyncIterator({
            next: mockInnerNext,
            return: mockInnerReturn,
        });
    });
    it('calls `return()` on the inner iterator when calling `return()`', () => {
        interruptibleIterator.return('return');
        expect(mockInnerReturn).toHaveBeenCalledWith('return');
    });
    it('resolves to the terminal result with that value when calling `return()`', async () => {
        expect.assertions(1);
        await expect(interruptibleIterator.return('return')).resolves.toStrictEqual({
            done: true,
            value: 'return',
        });
    });
    it('resolves different results on subsequent identical calls to `return()`', async () => {
        expect.assertions(1);
        const [returnResultA, returnResultB] = await Promise.all([
            interruptibleIterator.return('return'),
            interruptibleIterator.return('return'),
        ]);
        expect(returnResultA).not.toBe(returnResultB);
    });
    it("does not wait for the inner iterator's `return()` method to resolve before resolving", async () => {
        expect.assertions(1);
        mockInnerReturn.mockReturnValue(
            new Promise(() => {
                /* never resolves */
            }),
        );
        await expect(interruptibleIterator.return('return').then(() => 'done')).resolves.toBe('done');
    });
    it("does not resolve to the value returned by the inner iterator's `return()` method", async () => {
        expect.assertions(1);
        const innerReturnResult = { done: true, value: 'return' } as const;
        mockInnerReturn.mockResolvedValue(innerReturnResult);
        await expect(interruptibleIterator.return('return')).resolves.not.toBe(innerReturnResult);
    });
    describe('when `return()` has already been called', () => {
        beforeEach(async () => {
            await interruptibleIterator.return('return');
        });
        it('does not forward calls to `next()` to the inner iterator', () => {
            mockInnerNext.mockClear();
            interruptibleIterator.next('next');
            expect(mockInnerNext).not.toHaveBeenCalled();
        });
        it('does not forward calls to `return()` to the inner iterator', () => {
            mockInnerReturn.mockClear();
            interruptibleIterator.return('return');
            expect(mockInnerReturn).not.toHaveBeenCalled();
        });
        it('resolves the terminal result on subsequent calls to `next()`', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.next('next')).resolves.toStrictEqual({
                done: true,
                value: 'return',
            });
        });
    });
    describe('given that the last call to `next()` pends indefinitely', () => {
        beforeEach(() => {
            mockInnerNext.mockReturnValue(
                new Promise(() => {
                    /* never resolve */
                }),
            );
        });
        it('resolves to the terminal result with that value immediately when `return()` is called', async () => {
            expect.assertions(2);
            const nextPromise = interruptibleIterator.next('next');
            await expect(Promise.race(['pending', nextPromise])).resolves.toBe('pending');
            interruptibleIterator.return('return');
            await expect(nextPromise).resolves.toStrictEqual({
                done: true,
                value: 'return',
            });
        });
    });
    describe('given that the last call to `next()` resolved to a terminal result', () => {
        let terminalResult: IteratorReturnResult<'return'>;
        beforeEach(async () => {
            terminalResult = { done: true, value: 'return' };
            mockInnerNext.mockResolvedValue(terminalResult);
            await interruptibleIterator.next('next');
        });
        it('returns something equal to that value on subsequent calls to `return()`', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.return('return')).resolves.toStrictEqual(terminalResult);
        });
        it('returns something that is not exactly that value on subsequent calls to `return()`', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.return('return')).resolves.not.toBe(terminalResult);
        });
        it('does not forward subsequent calls to `next()` to the inner iterator', () => {
            mockInnerNext.mockClear();
            interruptibleIterator.next('next');
            expect(mockInnerNext).not.toHaveBeenCalled();
        });
        it('does not forward subsequent calls to `return()` to the inner iterator', () => {
            mockInnerReturn.mockClear();
            interruptibleIterator.return('return');
            expect(mockInnerReturn).not.toHaveBeenCalled();
        });
    });
});

describe('an interruptible `AsyncIterator` whose inner iterator does not implement `return()`', () => {
    let interruptibleIterator: InterruptibleAsyncIterator<42, 'return', 'next'>;
    let mockInnerNext: jest.Mock<Promise<IteratorResult<42, 'return'>>, ['next']>;
    beforeEach(() => {
        mockInnerNext = jest.fn().mockResolvedValue({ done: false, value: 42 });
        interruptibleIterator = createInterruptibleAsyncIterator({
            next: mockInnerNext,
        });
    });
    it('resolves to the terminal result with that value when `return()` is called', async () => {
        expect.assertions(1);
        await expect(interruptibleIterator.return('return')).resolves.toStrictEqual({
            done: true,
            value: 'return',
        });
    });
    it('resolves different results on subsequent calls to `return()`', async () => {
        expect.assertions(1);
        const [returnResultA, returnResultB] = await Promise.all([
            interruptibleIterator.return('return'),
            interruptibleIterator.return('return'),
        ]);
        expect(returnResultA).not.toBe(returnResultB);
    });
    describe('when `return()` has already been called', () => {
        beforeEach(async () => {
            await interruptibleIterator.return('return');
        });
        it('does not forward calls to `next()` to the inner iterator', () => {
            mockInnerNext.mockClear();
            interruptibleIterator.next('next');
            expect(mockInnerNext).not.toHaveBeenCalled();
        });
        it('resolves to the terminal result with that value on subsequent calls to `next()`', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.next('next')).resolves.toStrictEqual({
                done: true,
                value: 'return',
            });
        });
    });
    describe('given that the last call to `next()` pends indefinitely', () => {
        beforeEach(() => {
            mockInnerNext.mockReturnValue(
                new Promise(() => {
                    /* never resolve */
                }),
            );
        });
        it('resolves to the terminal result with that value immediately when `return()` is called', async () => {
            expect.assertions(2);
            const nextPromise = interruptibleIterator.next('next');
            await expect(Promise.race(['pending', nextPromise])).resolves.toBe('pending');
            interruptibleIterator.return('return');
            await expect(nextPromise).resolves.toStrictEqual({
                done: true,
                value: 'return',
            });
        });
    });
    describe('given that the last call to `next()` resolved to a terminal result', () => {
        beforeEach(async () => {
            mockInnerNext.mockResolvedValue({ done: true, value: 'return' });
            await interruptibleIterator.next('next');
        });
        it('returns that value on subsequent calls to `next()`', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.next('next')).resolves.toStrictEqual({
                done: true,
                value: 'return',
            });
        });
        it('returns that value on subsequent calls to `return()`', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.return('return')).resolves.toStrictEqual({
                done: true,
                value: 'return',
            });
        });
        it('does not forward subsequent calls to `next()` to the inner iterator', () => {
            mockInnerNext.mockClear();
            interruptibleIterator.next('next');
            expect(mockInnerNext).not.toHaveBeenCalled();
        });
    });
});

describe('an interruptible `AsyncIterator` whose inner iterator implements `throw()`', () => {
    let interruptibleIterator: InterruptibleAsyncIterator<42, 'return', 'next'> & {
        throw(e: 666): Promise<IteratorResult<42, 'return'>>;
    };
    let mockInnerNext: jest.Mock<Promise<IteratorResult<42, 'return'>>, ['next']>;
    let mockInnerThrow: jest.Mock<Promise<IteratorResult<42, 'return'>>>;
    beforeEach(() => {
        mockInnerNext = jest.fn().mockResolvedValue({ done: false, value: 42 });
        mockInnerThrow = jest.fn().mockResolvedValue({ done: false, value: 42 });
        interruptibleIterator = createInterruptibleAsyncIterator({
            next: mockInnerNext,
            throw: mockInnerThrow,
        });
    });
    it('forwards calls to `throw()` to the inner iterator', () => {
        interruptibleIterator.throw(666);
        expect(mockInnerThrow).toHaveBeenCalledWith(666);
    });
    describe('given that the last call to `throw()` rejected', () => {
        beforeEach(() => {
            mockInnerThrow.mockRejectedValueOnce('o no');
        });
        it('rejects with that value when `throw()` is called', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.throw(666)).rejects.toBe('o no');
        });
        describe('after the call to `throw()` rejects', () => {
            beforeEach(async () => {
                await interruptibleIterator.throw(666).catch(() => {});
            });
            it('does not forward subsequent calls to `next()` to the inner iterator', () => {
                mockInnerNext.mockClear();
                interruptibleIterator.next('next');
                expect(mockInnerNext).not.toHaveBeenCalled();
            });
            it('does not forward subsequent calls to `throw()` to the inner iterator', () => {
                mockInnerThrow.mockClear();
                interruptibleIterator.throw(666);
                expect(mockInnerThrow).not.toHaveBeenCalled();
            });
            it('returns a terminal result on subsequent calls to `next()`', async () => {
                expect.assertions(1);
                await expect(interruptibleIterator.next('next')).resolves.toStrictEqual({
                    done: true,
                    value: undefined,
                });
            });
            it('returns a terminal result on subsequent calls to `throw()`', async () => {
                expect.assertions(1);
                await expect(interruptibleIterator.throw(666)).resolves.toStrictEqual({
                    done: true,
                    value: undefined,
                });
            });
        });
    });
    describe('given that the last call to `throw()` pends indefinitely', () => {
        beforeEach(() => {
            mockInnerThrow.mockReturnValue(
                new Promise(() => {
                    /* never resolve */
                }),
            );
        });
        it('resolves to the terminal result immediately when `return()` is called', async () => {
            expect.assertions(2);
            const throwPromise = interruptibleIterator.throw(666);
            await expect(Promise.race(['pending', throwPromise])).resolves.toBe('pending');
            interruptibleIterator.return('return');
            await expect(throwPromise).resolves.toStrictEqual({
                done: true,
                value: 'return',
            });
        });
    });
    describe('given that the last call to `throw()` resolved to a terminal result', () => {
        beforeEach(async () => {
            mockInnerThrow.mockResolvedValue({ done: true, value: 'return' });
            await interruptibleIterator.throw(666);
        });
        it('returns that value on subsequent calls to `next()`', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.next('next')).resolves.toStrictEqual({
                done: true,
                value: 'return',
            });
        });
        it('returns that value on subsequent calls to `return()`', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.return('return')).resolves.toStrictEqual({
                done: true,
                value: 'return',
            });
        });
        it('returns that value on subsequent calls to `throw()`', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.throw(666)).resolves.toStrictEqual({
                done: true,
                value: 'return',
            });
        });
        it('does not forward subsequent calls to `next()` to the inner iterator', () => {
            mockInnerNext.mockClear();
            interruptibleIterator.next('next');
            expect(mockInnerNext).not.toHaveBeenCalled();
        });
        it('does not forward subsequent calls to `throw()` to the inner iterator', () => {
            mockInnerThrow.mockClear();
            interruptibleIterator.throw(666);
            expect(mockInnerThrow).not.toHaveBeenCalled();
        });
    });
    describe('when `return()` has already been called', () => {
        beforeEach(async () => {
            await interruptibleIterator.return('return');
        });
        it('does not forward calls to `throw()` to the inner iterator', () => {
            mockInnerThrow.mockClear();
            interruptibleIterator.throw(666);
            expect(mockInnerThrow).not.toHaveBeenCalled();
        });
        it('resolves the terminal result on subsequent calls to `throw()`', async () => {
            expect.assertions(1);
            await expect(interruptibleIterator.throw(666)).resolves.toStrictEqual({
                done: true,
                value: 'return',
            });
        });
    });
});

describe('an interruptible `AsyncIterator` whose inner iterator does not implement `throw()`', () => {
    let interruptibleIterator: InterruptibleAsyncIterator<42, 'return', 'next'>;
    let mockInnerNext: jest.Mock<Promise<IteratorResult<42, 'return'>>, ['next']>;
    beforeEach(() => {
        mockInnerNext = jest.fn().mockResolvedValue({ done: false, value: 42 });
        interruptibleIterator = createInterruptibleAsyncIterator({
            next: mockInnerNext,
        });
    });
    it('has no `throw()` method', () => {
        expect(interruptibleIterator).not.toHaveProperty('throw');
    });
});
