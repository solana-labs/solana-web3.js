import { createAsyncIterableFromDataPublisher } from '../async-iterable';
import { DataPublisher } from '../data-publisher';

describe('createAsyncIterableFromDataPublisher', () => {
    let mockDataPublisher: DataPublisher;
    let mockOn: jest.Mock;
    function publish(type: string, payload: unknown) {
        mockOn.mock.calls.filter(([actualType]) => actualType === type).forEach(([_, listener]) => listener(payload));
    }
    beforeEach(() => {
        mockOn = jest.fn().mockReturnValue(function unsubscribe() {});
        mockDataPublisher = {
            on: mockOn,
        };
    });
    it('returns from the iterator when the abort signal starts aborted', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        abortController.abort();
        const iterable = createAsyncIterableFromDataPublisher({
            abortSignal: abortController.signal,
            dataChannelName: 'data',
            dataPublisher: mockDataPublisher,
            errorChannelName: 'error',
        });
        const iterator = iterable[Symbol.asyncIterator]();
        const nextDataPromise = iterator.next();
        await expect(nextDataPromise).resolves.toMatchObject({
            done: true,
            value: undefined,
        });
    });
    it('returns from the iterator when the abort signal fires', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        const iterable = createAsyncIterableFromDataPublisher({
            abortSignal: abortController.signal,
            dataChannelName: 'data',
            dataPublisher: mockDataPublisher,
            errorChannelName: 'error',
        });
        const iterator = iterable[Symbol.asyncIterator]();
        const nextDataPromise = iterator.next();
        abortController.abort();
        await expect(nextDataPromise).resolves.toMatchObject({
            done: true,
            value: undefined,
        });
    });
    it('throws the first published error through newly created iterators', async () => {
        expect.assertions(1);
        const iterable = createAsyncIterableFromDataPublisher({
            abortSignal: new AbortController().signal,
            dataChannelName: 'data',
            dataPublisher: mockDataPublisher,
            errorChannelName: 'error',
        });
        publish('error', new Error('o no'));
        publish('error', new Error('also o no'));
        const iterator = iterable[Symbol.asyncIterator]();
        const nextDataPromise = iterator.next();
        await expect(nextDataPromise).rejects.toThrow(new Error('o no'));
    });
    it('returns from the iterator on the next poll after an error', async () => {
        expect.assertions(1);
        const iterable = createAsyncIterableFromDataPublisher({
            abortSignal: new AbortController().signal,
            dataChannelName: 'data',
            dataPublisher: mockDataPublisher,
            errorChannelName: 'error',
        });
        publish('error', new Error('o no'));
        const iterator = iterable[Symbol.asyncIterator]();
        iterator.next().catch(() => {});
        const dataPromiseAfterError = iterator.next();
        await expect(dataPromiseAfterError).resolves.toStrictEqual({
            done: true,
            value: undefined,
        });
    });
    describe('given that no iterator has yet been polled', () => {
        let abortController: AbortController;
        let iterable: AsyncIterable<unknown>;
        let iterator: AsyncIterator<unknown>;
        beforeEach(() => {
            abortController = new AbortController();
            iterable = createAsyncIterableFromDataPublisher({
                abortSignal: abortController.signal,
                dataChannelName: 'data',
                dataPublisher: mockDataPublisher,
                errorChannelName: 'error',
            });
            iterator = iterable[Symbol.asyncIterator]();
        });
        it('drops data published before polling begins', async () => {
            expect.assertions(1);
            publish('data', 'lost message');
            const nextDataPromise = iterator.next();
            publish('data', 'hi');
            await expect(nextDataPromise).resolves.toStrictEqual({
                done: false,
                value: 'hi',
            });
        });
        it('vends the first error received when the iterator is eventually polled', async () => {
            expect.assertions(1);
            publish('error', new Error('o no'));
            publish('error', new Error('also o no'));
            const nextDataPromise = iterator.next();
            await expect(nextDataPromise).rejects.toThrow(new Error('o no'));
        });
        it('returns when the iterator is eventually polled, the iterator having already been aborted', async () => {
            expect.assertions(1);
            abortController.abort();
            const nextDataPromise = iterator.next();
            await expect(nextDataPromise).resolves.toStrictEqual({
                done: true,
                value: undefined,
            });
        });
    });
    describe('given that multiple consumers have begun to poll', () => {
        let abortController: AbortController;
        let iteratorA: AsyncIterator<unknown>;
        let iteratorB: AsyncIterator<unknown>;
        let nextDataPromiseA: Promise<unknown>;
        let nextDataPromiseB: Promise<unknown>;
        beforeEach(() => {
            abortController = new AbortController();
            const iterable = createAsyncIterableFromDataPublisher({
                abortSignal: abortController.signal,
                dataChannelName: 'data',
                dataPublisher: mockDataPublisher,
                errorChannelName: 'error',
            });
            iteratorA = iterable[Symbol.asyncIterator]();
            iteratorB = iterable[Symbol.asyncIterator]();
            nextDataPromiseA = iteratorA.next();
            nextDataPromiseB = iteratorB.next();
        });
        it('throws from all iterators when an error is published', async () => {
            expect.assertions(2);
            publish('error', new Error('o no'));
            await expect(nextDataPromiseA).rejects.toThrow(new Error('o no'));
            await expect(nextDataPromiseB).rejects.toThrow(new Error('o no'));
        });
        it('vends a message to all iterators who have already polled for a result', async () => {
            expect.assertions(2);
            publish('data', 'hi');
            await expect(nextDataPromiseA).resolves.toStrictEqual({
                done: false,
                value: 'hi',
            });
            await expect(nextDataPromiseB).resolves.toStrictEqual({
                done: false,
                value: 'hi',
            });
        });
        it('queues messages for all iterators', async () => {
            expect.assertions(4);
            publish('data', 'consumed message');
            publish('data', 'queued message 1');
            publish('data', 'queued message 2');
            await expect(iteratorA.next()).resolves.toStrictEqual({
                done: false,
                value: 'queued message 1',
            });
            await expect(iteratorB.next()).resolves.toStrictEqual({
                done: false,
                value: 'queued message 1',
            });
            await expect(iteratorA.next()).resolves.toStrictEqual({
                done: false,
                value: 'queued message 2',
            });
            await expect(iteratorB.next()).resolves.toStrictEqual({
                done: false,
                value: 'queued message 2',
            });
        });
        it('flushes the queue before vending errors', async () => {
            expect.assertions(4);
            publish('data', 'consumed message');
            publish('data', 'queued message 1');
            publish('error', new Error('o no'));
            await expect(iteratorA.next()).resolves.toStrictEqual({
                done: false,
                value: 'queued message 1',
            });
            await expect(iteratorB.next()).resolves.toStrictEqual({
                done: false,
                value: 'queued message 1',
            });
            await expect(iteratorA.next()).rejects.toThrow(new Error('o no'));
            await expect(iteratorB.next()).rejects.toThrow(new Error('o no'));
        });
        it('flushes the queue before an abort finalizes it', async () => {
            expect.assertions(4);
            publish('data', 'consumed message');
            publish('data', 'queued message 1');
            abortController.abort();
            await expect(iteratorA.next()).resolves.toStrictEqual({
                done: false,
                value: 'queued message 1',
            });
            await expect(iteratorB.next()).resolves.toStrictEqual({
                done: false,
                value: 'queued message 1',
            });
            await expect(iteratorA.next()).resolves.toStrictEqual({
                done: true,
                value: undefined,
            });
            await expect(iteratorB.next()).resolves.toStrictEqual({
                done: true,
                value: undefined,
            });
        });
    });
});
