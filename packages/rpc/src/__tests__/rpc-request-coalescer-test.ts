import type { RpcTransport } from '@solana/rpc-spec';

import { getRpcTransportWithRequestCoalescing } from '../rpc-request-coalescer';

describe('RPC request coalescer', () => {
    let coalescedTransport: RpcTransport;
    let hashFn: jest.MockedFunction<() => string | undefined>;
    let mockTransport: jest.MockedFunction<RpcTransport>;
    beforeEach(() => {
        jest.useFakeTimers();
        hashFn = jest.fn();
        mockTransport = jest.fn().mockResolvedValue(null);
        coalescedTransport = getRpcTransportWithRequestCoalescing(mockTransport, hashFn);
    });
    describe('when requests produce the same hash', () => {
        beforeEach(() => {
            hashFn.mockReturnValue('samehash');
        });
        it('multiple requests in the same tick produce a single transport request', () => {
            coalescedTransport({ payload: null });
            coalescedTransport({ payload: null });
            expect(mockTransport).toHaveBeenCalledTimes(1);
        });
        it('multiple requests in different ticks each produce their own transport request', async () => {
            expect.assertions(1);
            coalescedTransport({ payload: null });
            await jest.runOnlyPendingTimersAsync();
            coalescedTransport({ payload: null });
            expect(mockTransport).toHaveBeenCalledTimes(2);
        });
        it('multiple requests in the same tick receive the same response', async () => {
            expect.assertions(2);
            const mockResponse = { response: 'ok' };
            mockTransport.mockResolvedValueOnce(mockResponse);
            const responsePromiseA = coalescedTransport({ payload: null });
            const responsePromiseB = coalescedTransport({ payload: null });
            await Promise.all([
                expect(responsePromiseA).resolves.toBe(mockResponse),
                expect(responsePromiseB).resolves.toBe(mockResponse),
            ]);
        });
        it('multiple requests in different ticks receive different responses', async () => {
            expect.assertions(2);
            const mockResponseA = { response: 'okA' };
            const mockResponseB = { response: 'okB' };
            mockTransport.mockResolvedValueOnce(mockResponseA);
            mockTransport.mockResolvedValueOnce(mockResponseB);
            const responsePromiseA = coalescedTransport({ payload: null });
            await jest.runOnlyPendingTimersAsync();
            const responsePromiseB = coalescedTransport({ payload: null });
            await Promise.all([
                expect(responsePromiseA).resolves.toBe(mockResponseA),
                expect(responsePromiseB).resolves.toBe(mockResponseB),
            ]);
        });
        it('multiple requests in the same tick receive the same error in the case of failure', async () => {
            expect.assertions(2);
            const mockError = { err: 'bad' };
            mockTransport.mockRejectedValueOnce(mockError);
            const responsePromiseA = coalescedTransport({ payload: null });
            const responsePromiseB = coalescedTransport({ payload: null });
            await Promise.all([
                expect(responsePromiseA).rejects.toBe(mockError),
                expect(responsePromiseB).rejects.toBe(mockError),
            ]);
        });
        it('multiple requests in different ticks receive different errors in the case of failure', async () => {
            expect.assertions(2);
            const mockErrorA = { err: 'badA' };
            const mockErrorB = { err: 'badB' };
            mockTransport.mockRejectedValueOnce(mockErrorA);
            mockTransport.mockRejectedValueOnce(mockErrorB);
            const responsePromiseA = coalescedTransport({ payload: null });
            // eslint-disable-next-line jest/valid-expect
            const expectationA = expect(responsePromiseA).rejects.toBe(mockErrorA);
            await jest.runOnlyPendingTimersAsync();
            const responsePromiseB = coalescedTransport({ payload: null });
            // eslint-disable-next-line jest/valid-expect
            const expectationB = expect(responsePromiseB).rejects.toBe(mockErrorB);
            await Promise.all([expectationA, expectationB]);
        });
        describe('multiple coalesced requests each with an abort signal', () => {
            let abortControllerA: AbortController;
            let abortControllerB: AbortController;
            let responsePromiseA: ReturnType<typeof mockTransport>;
            let responsePromiseB: ReturnType<typeof mockTransport>;
            let transportResponsePromise: (value: unknown) => void;
            beforeEach(() => {
                abortControllerA = new AbortController();
                abortControllerB = new AbortController();
                mockTransport.mockImplementation(async ({ signal }) => {
                    signal?.throwIfAborted();
                    return await new Promise((resolve, reject) => {
                        transportResponsePromise = resolve;
                        signal?.addEventListener('abort', (e: AbortSignalEventMap['abort']) => {
                            reject((e.target as AbortSignal).reason);
                        });
                    });
                });
                responsePromiseA = coalescedTransport({ payload: null, signal: abortControllerA.signal });
                responsePromiseB = coalescedTransport({ payload: null, signal: abortControllerB.signal });
            });
            afterEach(async () => {
                try {
                    // Unconditionally await the requests so that the tests don't leak.
                    await Promise.all([responsePromiseA, responsePromiseB]);
                } catch {
                    /* empty */
                }
            });
            it('throws an `AbortError` from the aborted request when no reason is specified', async () => {
                expect.assertions(3);
                abortControllerA.abort();
                await expect(responsePromiseA).rejects.toThrow();
                await expect(responsePromiseA).rejects.toBeInstanceOf(DOMException);
                await expect(responsePromiseA).rejects.toHaveProperty('name', 'AbortError');
            });
            it("rejects from the aborted request with the `AbortSignal's` reason", async () => {
                expect.assertions(1);
                abortControllerA.abort('o no');
                await expect(responsePromiseA).rejects.toBe('o no');
            });
            it('aborts the transport when all of the requests abort', () => {
                abortControllerA.abort('o no A');
                abortControllerB.abort('o no B');
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const transportAbortSignal = mockTransport.mock.lastCall![0].signal!;
                expect(transportAbortSignal.aborted).toBe(true);
            });
            it('does not abort the transport if fewer than every request aborts', async () => {
                expect.assertions(1);
                abortControllerA.abort('o no A');
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const transportAbortSignal = mockTransport.mock.lastCall![0].signal!;
                await expect(transportAbortSignal.aborted).toBe(false);
            });
            it('delivers responses to all but the aborted requests', async () => {
                expect.assertions(2);
                abortControllerA.abort('o no A');
                const mockResponse = { response: 'ok' };
                transportResponsePromise(mockResponse);
                await Promise.all([
                    expect(responsePromiseA).rejects.toBe('o no A'),
                    expect(responsePromiseB).resolves.toBe(mockResponse),
                ]);
            });
        });
    });
    [
        {
            getHashFn() {
                let counter = 0;
                return () => `hash-${counter++}`;
            },
            hashDescription: 'different hashes',
        },
        {
            getHashFn() {
                return () => undefined;
            },
            hashDescription: 'no hash',
        },
    ].forEach(({ hashDescription, getHashFn }) => {
        describe(`when requests produce ${hashDescription}`, () => {
            beforeEach(() => {
                hashFn.mockImplementation(getHashFn());
            });
            it('multiple requests in the same tick produce one transport request each', () => {
                coalescedTransport({ payload: null });
                coalescedTransport({ payload: null });
                expect(mockTransport).toHaveBeenCalledTimes(2);
            });
            it('multiple requests in the same tick receive different responses', async () => {
                expect.assertions(2);
                const mockResponseA = { response: 'okA' };
                const mockResponseB = { response: 'okB' };
                mockTransport.mockResolvedValueOnce(mockResponseA);
                mockTransport.mockResolvedValueOnce(mockResponseB);
                const responsePromiseA = coalescedTransport({ payload: null });
                const responsePromiseB = coalescedTransport({ payload: null });
                await Promise.all([
                    expect(responsePromiseA).resolves.toBe(mockResponseA),
                    expect(responsePromiseB).resolves.toBe(mockResponseB),
                ]);
            });
            it('multiple requests in the same tick receive different errors in the case of failure', async () => {
                expect.assertions(2);
                const mockErrorA = { err: 'badA' };
                const mockErrorB = { err: 'badB' };
                mockTransport.mockRejectedValueOnce(mockErrorA);
                mockTransport.mockRejectedValueOnce(mockErrorB);
                const responsePromiseA = coalescedTransport({ payload: null });
                const responsePromiseB = coalescedTransport({ payload: null });
                await Promise.all([
                    expect(responsePromiseA).rejects.toBe(mockErrorA),
                    expect(responsePromiseB).rejects.toBe(mockErrorB),
                ]);
            });
        });
    });
});
