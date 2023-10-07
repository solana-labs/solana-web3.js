import { createBlockHeightExceedencePromiseFactory } from '../transaction-confirmation-strategy-blockheight';

const FOREVER_PROMISE = new Promise(() => {
    /* never resolve */
});

describe('createBlockHeightExceedencePromiseFactory', () => {
    let createSubscriptionIterable: jest.Mock;
    let getBlockHeightExceedencePromise: ReturnType<typeof createBlockHeightExceedencePromiseFactory>;
    let slotNotificationsGenerator: jest.Mock;
    beforeEach(() => {
        jest.useFakeTimers();
        slotNotificationsGenerator = jest.fn().mockImplementation(async function* () {
            yield await FOREVER_PROMISE;
        });
        createSubscriptionIterable = jest.fn().mockResolvedValue({
            [Symbol.asyncIterator]: slotNotificationsGenerator,
        });
        const rpcSubscriptions = {
            slotNotifications: () => ({
                subscribe: createSubscriptionIterable,
            }),
        };
        getBlockHeightExceedencePromise = createBlockHeightExceedencePromiseFactory(rpcSubscriptions);
    });
    it('continues to pend when the slot received is less than the last valid slot', async () => {
        expect.assertions(1);
        slotNotificationsGenerator.mockImplementation(async function* () {
            yield { slot: 120n };
            yield { slot: 121n };
            yield { slot: 122n };
            yield await FOREVER_PROMISE;
        });
        const exceedencePromise = getBlockHeightExceedencePromise({
            abortSignal: new AbortController().signal,
            lastValidBlockHeight: 123n,
        });
        await jest.runAllTimersAsync();
        await expect(Promise.race([exceedencePromise, 'pending'])).resolves.toBe('pending');
    });
    it('continues to pend when the slot received is equal to the last valid slot', async () => {
        expect.assertions(1);
        slotNotificationsGenerator.mockImplementation(async function* () {
            yield { slot: 123n };
            yield await FOREVER_PROMISE;
        });
        const exceedencePromise = getBlockHeightExceedencePromise({
            abortSignal: new AbortController().signal,
            lastValidBlockHeight: 123n,
        });
        await jest.runAllTimersAsync();
        await expect(Promise.race([exceedencePromise, 'pending'])).resolves.toBe('pending');
    });
    it('throws when the slot received is higher than the last valid slot', async () => {
        expect.assertions(1);
        slotNotificationsGenerator.mockImplementation(async function* () {
            yield { slot: 124n };
            yield await FOREVER_PROMISE;
        });
        const exceedencePromise = getBlockHeightExceedencePromise({
            abortSignal: new AbortController().signal,
            lastValidBlockHeight: 123n,
        });
        await expect(exceedencePromise).rejects.toThrow(
            'The network has progressed past the last block for which this transaction could have committed.'
        );
    });
    it('calls the abort signal passed to the slot subscription when aborted', async () => {
        expect.assertions(2);
        const abortController = new AbortController();
        getBlockHeightExceedencePromise({
            abortSignal: abortController.signal,
            lastValidBlockHeight: 123n,
        });
        expect(createSubscriptionIterable).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: false }),
        });
        abortController.abort();
        expect(createSubscriptionIterable).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: true }),
        });
    });
});
