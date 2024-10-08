import { RpcSubscriptionsChannel, RpcSubscriptionsChannelCreator } from '@solana/rpc-subscriptions-spec';

import { getChannelPoolingChannelCreator } from '../rpc-subscriptions-channel-pool';
import { ChannelPoolEntry, createChannelPool } from '../rpc-subscriptions-channel-pool-internal';

jest.mock('../rpc-subscriptions-channel-pool-internal.ts');

describe('getChannelPoolingChannelCreator', () => {
    let channelPool: { entries: ChannelPoolEntry[]; freeChannelIndex: number };
    let createChannel: jest.MockedFunction<RpcSubscriptionsChannelCreator<unknown, unknown>>;
    beforeEach(() => {
        channelPool = { entries: [], freeChannelIndex: -1 };
        jest.mocked(createChannelPool).mockReturnValue(channelPool);
        createChannel = jest
            .fn()
            // We need this to return a new promise on every call.
            // eslint-disable-next-line jest/prefer-mock-promise-shorthand
            .mockImplementation(() =>
                Promise.resolve({
                    on: jest.fn().mockReturnValue(() => {}),
                    send: jest.fn().mockResolvedValue(void 0),
                }),
            );
    });
    it('creates a new channel when there are fewer than `minChannels`', async () => {
        expect.assertions(2);
        const newChannel = {} as RpcSubscriptionsChannel<unknown, unknown>;
        createChannel.mockResolvedValue(newChannel);
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: Number.POSITIVE_INFINITY,
            minChannels: 1,
        });
        await poolingChannelCreator({ abortSignal: new AbortController().signal });
        expect(createChannel).toHaveBeenCalledTimes(1);
        expect(channelPool).toMatchObject({
            entries: [{ channel: newChannel, subscriptionCount: 1 }],
            freeChannelIndex: 0,
        });
    });
    it('increments the subscriber count of an existing channel pool entry when vending it', () => {
        const newChannel = {} as RpcSubscriptionsChannel<unknown, unknown>;
        createChannel.mockResolvedValue(newChannel);
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: Number.POSITIVE_INFINITY,
            minChannels: 1,
        });
        poolingChannelCreator({ abortSignal: new AbortController().signal }).catch(() => {});
        poolingChannelCreator({ abortSignal: new AbortController().signal }).catch(() => {});
        expect(channelPool).toMatchObject({
            entries: [{ channel: newChannel, subscriptionCount: 2 }],
            freeChannelIndex: 0,
        });
    });
    it('creates a new channel pool entry when the existing one already has `maxSubscriptionsPerChannel` consumers', () => {
        const newChannelA = {} as RpcSubscriptionsChannel<unknown, unknown>;
        const newChannelB = {} as RpcSubscriptionsChannel<unknown, unknown>;
        createChannel.mockResolvedValueOnce(newChannelA).mockResolvedValueOnce(newChannelB);
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: 1,
            minChannels: 1,
        });
        poolingChannelCreator({ abortSignal: new AbortController().signal }).catch(() => {});
        poolingChannelCreator({ abortSignal: new AbortController().signal }).catch(() => {});
        expect(channelPool).toMatchObject({
            entries: [
                { channel: newChannelA, subscriptionCount: 1 },
                { channel: newChannelB, subscriptionCount: 1 },
            ],
            freeChannelIndex: -1,
        });
    });
    it('destroys a channel when the last subscriber aborts', () => {
        const newChannelA = {} as RpcSubscriptionsChannel<unknown, unknown>;
        const newChannelB = {} as RpcSubscriptionsChannel<unknown, unknown>;
        createChannel.mockResolvedValueOnce(newChannelA).mockResolvedValueOnce(newChannelB);
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: Number.POSITIVE_INFINITY,
            minChannels: 1,
        });
        const abortController = new AbortController();
        poolingChannelCreator({ abortSignal: abortController.signal }).catch(() => {});
        expect(channelPool).toMatchObject({
            entries: [{ channel: newChannelA, subscriptionCount: 1 }],
            freeChannelIndex: 0,
        });
        abortController.abort();
        expect(channelPool).toMatchObject({
            entries: [],
            freeChannelIndex: -1,
        });
    });
    it('moves the free channel index to the next channel with the most capacity when destroying the existing one', () => {
        const channelPool = { entries: [] as ChannelPoolEntry[], freeChannelIndex: -1 };
        jest.mocked(createChannelPool).mockReturnValue(channelPool);
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: Number.POSITIVE_INFINITY,
            minChannels: 1,
        });
        const abortController = new AbortController();
        poolingChannelCreator({ abortSignal: abortController.signal }).catch(() => {});
        channelPool.entries = [
            { subscriptionCount: 2 },
            ...channelPool.entries,
            { subscriptionCount: 3 },
        ] as ChannelPoolEntry[];
        channelPool.freeChannelIndex = 1;
        expect(channelPool).toMatchObject({
            entries: [{ subscriptionCount: 2 }, { subscriptionCount: 1 }, { subscriptionCount: 3 }],
            freeChannelIndex: 1,
        });
        abortController.abort();
        expect(channelPool).toMatchObject({
            entries: [{ subscriptionCount: 2 }, { subscriptionCount: 3 }],
            freeChannelIndex: 0,
        });
    });
    it('preserves the free channel index when destroying a channel even if that channel is now tied for the highest capacity', () => {
        const channelPool = { entries: [] as ChannelPoolEntry[], freeChannelIndex: -1 };
        jest.mocked(createChannelPool).mockReturnValue(channelPool);
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: Number.POSITIVE_INFINITY,
            minChannels: 1,
        });
        const abortController = new AbortController();
        poolingChannelCreator({ abortSignal: abortController.signal }).catch(() => {});
        poolingChannelCreator({ abortSignal: new AbortController().signal }).catch(() => {});
        channelPool.entries = [...channelPool.entries, { subscriptionCount: 1 }] as ChannelPoolEntry[];
        channelPool.freeChannelIndex = 1;
        expect(channelPool).toMatchObject({
            entries: [{ subscriptionCount: 2 }, { subscriptionCount: 1 }],
            freeChannelIndex: 1,
        });
        abortController.abort();
        expect(channelPool).toMatchObject({
            entries: [{ subscriptionCount: 1 }, { subscriptionCount: 1 }],
            freeChannelIndex: 1,
        });
    });
    it('resets the free channel index whenever destroying a channel results in there being fewer than `minChannels`', () => {
        const channelPool = { entries: [] as ChannelPoolEntry[], freeChannelIndex: -1 };
        jest.mocked(createChannelPool).mockReturnValue(channelPool);
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: 2,
            minChannels: 2,
        });
        const abortController = new AbortController();
        poolingChannelCreator({ abortSignal: new AbortController().signal }).catch(() => {});
        poolingChannelCreator({ abortSignal: abortController.signal }).catch(() => {});
        poolingChannelCreator({ abortSignal: new AbortController().signal }).catch(() => {});
        expect(channelPool).toMatchObject({
            entries: [{ subscriptionCount: 2 }, { subscriptionCount: 1 }],
            freeChannelIndex: 1,
        });
        abortController.abort();
        expect(channelPool).toMatchObject({
            entries: [{ subscriptionCount: 2 }],
            freeChannelIndex: -1,
        });
    });
    it('vends an existing channel when called in a separate runloop', async () => {
        expect.assertions(1);
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: Number.POSITIVE_INFINITY,
            minChannels: 1,
        });
        const channelA = await poolingChannelCreator({ abortSignal: new AbortController().signal });
        const channelB = await poolingChannelCreator({ abortSignal: new AbortController().signal });
        expect(channelA).toBe(channelB);
    });
    it('vends an existing channel when called concurrently in the same runloop', async () => {
        expect.assertions(1);
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: Number.POSITIVE_INFINITY,
            minChannels: 1,
        });
        const [channelA, channelB] = await Promise.all([
            poolingChannelCreator({ abortSignal: new AbortController().signal }),
            poolingChannelCreator({ abortSignal: new AbortController().signal }),
        ]);
        expect(channelA).toBe(channelB);
    });
    it("fires a created channel's abort signal when the outer signal is aborted", async () => {
        expect.assertions(1);
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: Number.POSITIVE_INFINITY,
            minChannels: 1,
        });
        const abortController = new AbortController();
        await poolingChannelCreator({ abortSignal: abortController.signal });
        abortController.abort();
        expect(createChannel.mock.lastCall?.[0].abortSignal).toHaveProperty('aborted', true);
    });
    it("fires a created channel's abort signal when the outer signal is aborted within the runloop", () => {
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: Number.POSITIVE_INFINITY,
            minChannels: 1,
        });
        const abortController = new AbortController();
        poolingChannelCreator({ abortSignal: abortController.signal }).catch(() => {});
        abortController.abort();
        expect(createChannel.mock.lastCall?.[0].abortSignal).toHaveProperty('aborted', true);
    });
    it('vends the next existing channel with the fewest consumers', async () => {
        expect.assertions(2);
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: 2,
            minChannels: 1,
        });
        poolingChannelCreator({ abortSignal: new AbortController().signal }).catch(() => {});
        poolingChannelCreator({ abortSignal: new AbortController().signal }).catch(() => {});
        poolingChannelCreator({ abortSignal: new AbortController().signal }).catch(() => {});
        expect(channelPool).toMatchObject({
            entries: [{ subscriptionCount: 2 }, { subscriptionCount: 1 }],
            freeChannelIndex: 1,
        });
        const channel = poolingChannelCreator({ abortSignal: new AbortController().signal });
        await expect(channel).resolves.toBe(await channelPool.entries[1].channel);
    });
    it('does not create a channel pool entry when the channel fails to construct', async () => {
        expect.assertions(3);
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: Number.POSITIVE_INFINITY,
            minChannels: 1,
        });
        createChannel.mockRejectedValueOnce('o no');
        const channelA = poolingChannelCreator({ abortSignal: new AbortController().signal });
        const channelB = poolingChannelCreator({ abortSignal: new AbortController().signal });
        await expect(channelA).rejects.toBe('o no');
        await expect(channelB).rejects.toBe('o no');
        expect(channelPool).toMatchObject({ entries: [], freeChannelIndex: -1 });
    });
    it("destroys a channel's pool entry when the channel encounters an error message", async () => {
        expect.assertions(2);
        jest.useFakeTimers();
        const poolingChannelCreator = getChannelPoolingChannelCreator(createChannel, {
            maxSubscriptionsPerChannel: Number.POSITIVE_INFINITY,
            minChannels: 1,
        });
        const errorListeners: CallableFunction[] = [];
        createChannel.mockResolvedValue({
            on(type, listener) {
                // eslint-disable-next-line jest/no-conditional-in-test
                if (type === 'error') {
                    errorListeners.push(listener);
                }
                return () => {};
            },
            send: jest.fn(),
        });
        poolingChannelCreator({ abortSignal: new AbortController().signal }).catch(() => {});
        poolingChannelCreator({ abortSignal: new AbortController().signal }).catch(() => {});
        expect(channelPool).toMatchObject({
            entries: [{ subscriptionCount: 2 }],
            freeChannelIndex: 0,
        });
        // Allow time for the channel to open and the error listener attach.
        await jest.runAllTimersAsync();
        errorListeners.forEach(listener => {
            listener('o no');
        });
        expect(channelPool).toMatchObject({ entries: [], freeChannelIndex: -1 });
    });
});
