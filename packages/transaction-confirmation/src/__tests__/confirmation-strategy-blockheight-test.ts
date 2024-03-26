import { SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED, SolanaError } from '@solana/errors';
import { Commitment } from '@solana/rpc-types';

import { createBlockHeightExceedencePromiseFactory } from '../confirmation-strategy-blockheight';

const FOREVER_PROMISE = new Promise(() => {
    /* never resolve */
});

describe('createBlockHeightExceedencePromiseFactory', () => {
    let createSubscriptionIterable: jest.Mock;
    let getBlockHeightExceedencePromise: ReturnType<typeof createBlockHeightExceedencePromiseFactory>;
    let getEpochInfoMock: jest.Mock;
    let getEpochInfoRequestSender: jest.Mock;
    let slotNotificationsGenerator: jest.Mock;
    beforeEach(() => {
        jest.useFakeTimers();
        getEpochInfoRequestSender = jest.fn();
        getEpochInfoMock = jest.fn().mockReturnValue({
            send: getEpochInfoRequestSender,
        });
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
        const rpc = {
            getEpochInfo: getEpochInfoMock,
        };
        getBlockHeightExceedencePromise = createBlockHeightExceedencePromiseFactory({
            rpc,
            rpcSubscriptions,
        });
    });
    it('throws when the block height has already been exceeded when called', async () => {
        expect.assertions(1);
        getEpochInfoRequestSender.mockResolvedValue({ absoluteSlot: 101n, blockHeight: 101n });
        const exceedencePromise = getBlockHeightExceedencePromise({
            abortSignal: new AbortController().signal,
            lastValidBlockHeight: 100n,
        });
        await expect(exceedencePromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED, {
                currentBlockHeight: 101n,
                lastValidBlockHeight: 100n,
            }),
        );
    });
    it('continues to pend when the block height in the initial fetch is lower than the last valid block height', async () => {
        expect.assertions(1);
        getEpochInfoRequestSender.mockResolvedValue({ absoluteSlot: 100n, blockHeight: 100n });
        const exceedencePromise = getBlockHeightExceedencePromise({
            abortSignal: new AbortController().signal,
            lastValidBlockHeight: 100n,
        });
        await jest.runAllTimersAsync();
        await expect(Promise.race([exceedencePromise, 'pending'])).resolves.toBe('pending');
    });
    it('throws when the slot at which the block height is expected to be exceeded is reached', async () => {
        expect.assertions(1);
        // Mock a delta between the slot height and the block height of 100 slots.
        getEpochInfoRequestSender.mockResolvedValueOnce({ absoluteSlot: 198n, blockHeight: 98n });
        slotNotificationsGenerator.mockImplementation(async function* () {
            yield { slot: 199n };
            yield { slot: 200n };
            yield { slot: 201n }; // Expected to be exceeded here.
            yield await FOREVER_PROMISE;
        });
        // Mock the block height recheck at the end
        getEpochInfoRequestSender.mockResolvedValueOnce({ absoluteSlot: 201n, blockHeight: 101n });
        const exceedencePromise = getBlockHeightExceedencePromise({
            abortSignal: new AbortController().signal,
            lastValidBlockHeight: 100n,
        });
        await expect(exceedencePromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED, {
                currentBlockHeight: 101n,
                lastValidBlockHeight: 100n,
            }),
        );
    });
    it('continues to pend when slot at which the block height is expected to be exceeded has not been reached', async () => {
        expect.assertions(1);
        // Mock a delta between the slot height and the block height of 100 slots.
        getEpochInfoRequestSender.mockResolvedValue({ absoluteSlot: 198n, blockHeight: 98n });
        slotNotificationsGenerator.mockImplementation(async function* () {
            yield { slot: 199n };
            yield { slot: 200n };
            yield await FOREVER_PROMISE;
        });
        // Mock the block height recheck at the end
        getEpochInfoRequestSender.mockResolvedValueOnce({ absoluteSlot: 200n, blockHeight: 100n });
        const exceedencePromise = getBlockHeightExceedencePromise({
            abortSignal: new AbortController().signal,
            lastValidBlockHeight: 100n,
        });
        await jest.runOnlyPendingTimersAsync();
        await expect(Promise.race([exceedencePromise, 'pending'])).resolves.toBe('pending');
    });
    it('throws when the slot height / block height delta eventually satisfies the slot at which the block height is expected to be exceeded being reached', async () => {
        expect.assertions(1);
        // Mock a delta between the slot height and the block height of 100 slots.
        getEpochInfoRequestSender.mockResolvedValueOnce({ absoluteSlot: 198n, blockHeight: 98n });
        slotNotificationsGenerator.mockImplementation(async function* () {
            yield { slot: 199n };
            yield { slot: 200n };
            yield { slot: 201n }; // Expected to be exceeded here.
            yield { slot: 202n }; // Actually exceeded here.
            yield await FOREVER_PROMISE;
        });
        // Mock the slot height / block height delta having grown by one.
        getEpochInfoRequestSender.mockResolvedValueOnce({ absoluteSlot: 201n, blockHeight: 100n });
        // Mock the final recheck where the block height catches up.
        getEpochInfoRequestSender.mockResolvedValueOnce({ absoluteSlot: 202n, blockHeight: 101n });
        const exceedencePromise = getBlockHeightExceedencePromise({
            abortSignal: new AbortController().signal,
            lastValidBlockHeight: 100n,
        });
        await expect(exceedencePromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED, {
                currentBlockHeight: 101n,
                lastValidBlockHeight: 100n,
            }),
        );
    });
    it('continues to pend when the slot height / block height delta grows by the time the slot at which the block height is expected to be exceeded is reached', async () => {
        expect.assertions(1);
        // Mock a delta between the slot height and the block height of 100 slots.
        getEpochInfoRequestSender.mockResolvedValueOnce({ absoluteSlot: 198n, blockHeight: 98n });
        slotNotificationsGenerator.mockImplementation(async function* () {
            yield { slot: 199n };
            yield { slot: 200n };
            yield { slot: 201n }; // Expected to be exceeded here.
            yield await FOREVER_PROMISE;
        });
        // Mock the slot height / block height delta having grown by one by the end
        getEpochInfoRequestSender.mockResolvedValueOnce({ absoluteSlot: 201n, blockHeight: 100n });
        const exceedencePromise = getBlockHeightExceedencePromise({
            abortSignal: new AbortController().signal,
            lastValidBlockHeight: 100n,
        });
        await jest.runOnlyPendingTimersAsync();
        await expect(Promise.race([exceedencePromise, 'pending'])).resolves.toBe('pending');
    });
    it.each(['processed', 'confirmed', 'finalized'] as Commitment[])(
        'calls the epoch info getter with the configured commitment when configured with `%s` commitment',
        commitment => {
            getEpochInfoRequestSender.mockResolvedValue({ absoluteSlot: 100n, blockHeight: 100n });
            getBlockHeightExceedencePromise({
                abortSignal: new AbortController().signal,
                commitment,
                lastValidBlockHeight: 100n,
            });
            expect(getEpochInfoMock).toHaveBeenCalledWith({ commitment });
        },
    );
    it('calls the abort signal passed to the epoch info fetcher when aborted', () => {
        const abortController = new AbortController();
        (async () => {
            try {
                await getBlockHeightExceedencePromise({
                    abortSignal: abortController.signal,
                    lastValidBlockHeight: 100n,
                });
            } catch {
                /* empty */
            }
        })();
        expect(getEpochInfoRequestSender).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: false }),
        });
        abortController.abort();
        expect(getEpochInfoRequestSender).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: true }),
        });
    });
    it('calls the abort signal passed to the slot subscription when aborted', () => {
        const abortController = new AbortController();
        (async () => {
            try {
                await getBlockHeightExceedencePromise({
                    abortSignal: abortController.signal,
                    lastValidBlockHeight: 100n,
                });
            } catch {
                /* empty */
            }
        })();
        expect(createSubscriptionIterable).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: false }),
        });
        abortController.abort();
        expect(createSubscriptionIterable).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: true }),
        });
    });
    it('throws errors thrown from the epoch info fetcher', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        abortController.abort();
        getEpochInfoRequestSender.mockRejectedValue(new Error('o no'));
        await expect(
            getBlockHeightExceedencePromise({
                abortSignal: abortController.signal,
                lastValidBlockHeight: 100n,
            }),
        ).rejects.toThrow('o no');
    });
    it('throws errors thrown from the slot subscription', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        abortController.abort();
        createSubscriptionIterable.mockRejectedValue(new Error('o no'));
        await expect(
            getBlockHeightExceedencePromise({
                abortSignal: abortController.signal,
                lastValidBlockHeight: 100n,
            }),
        ).rejects.toThrow('o no');
    });
});
