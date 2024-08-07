import { getAbortablePromise } from '../abortable';

describe('getAbortablePromise()', () => {
    let promise: Promise<unknown>;
    let resolve: (value: unknown) => void;
    let reject: (reason?: unknown) => void;
    beforeEach(() => {
        promise = new Promise<unknown>((res, rej) => {
            resolve = res;
            reject = rej;
        });
    });
    it('returns the original promise when called with no `AbortSignal`', () => {
        expect(getAbortablePromise(promise)).toBe(promise);
    });
    it('rejects with the `reason` when passed an already-aborted signal with a pending promise', async () => {
        expect.assertions(1);
        const signal = AbortSignal.abort('o no');
        await expect(getAbortablePromise(promise, signal)).rejects.toBe('o no');
    });
    it('rejects with the `reason` when passed an already-aborted signal and an already-resolved promise', async () => {
        expect.assertions(1);
        const signal = AbortSignal.abort('o no');
        resolve(123);
        await expect(getAbortablePromise(promise, signal)).rejects.toBe('o no');
    });
    it('rejects with the `reason` when passed an already-aborted signal and an already-rejected promise', async () => {
        expect.assertions(1);
        const signal = AbortSignal.abort('o no');
        reject('mais non');
        await expect(getAbortablePromise(promise, signal)).rejects.toBe('o no');
    });
    it('rejects with the `reason` when the signal aborts before the promise settles', async () => {
        expect.assertions(2);
        const controller = new AbortController();
        const abortablePromise = getAbortablePromise(promise, controller.signal);
        await expect(Promise.race(['pending', abortablePromise])).resolves.toBe('pending');
        controller.abort('o no');
        await expect(abortablePromise).rejects.toBe('o no');
    });
    it('rejects with the promise rejection when passed an already-rejected promise and a not-yet-aborted signal', async () => {
        expect.assertions(1);
        const signal = new AbortController().signal;
        reject('mais non');
        await expect(getAbortablePromise(promise, signal)).rejects.toBe('mais non');
    });
    it('rejects with the promise rejection when the promise rejects before the signal aborts', async () => {
        expect.assertions(2);
        const signal = new AbortController().signal;
        const abortablePromise = getAbortablePromise(promise, signal);
        await expect(Promise.race(['pending', abortablePromise])).resolves.toBe('pending');
        reject('mais non');
        await expect(abortablePromise).rejects.toBe('mais non');
    });
    it('resolves with the promise value when passed an already-resolved promise and a not-yet-aborted signal', async () => {
        expect.assertions(1);
        const signal = new AbortController().signal;
        resolve(123);
        await expect(getAbortablePromise(promise, signal)).resolves.toBe(123);
    });
    it('resolves with the promise value when the promise resolves before the signal aborts', async () => {
        expect.assertions(2);
        const signal = new AbortController().signal;
        const abortablePromise = getAbortablePromise(promise, signal);
        await expect(Promise.race(['pending', abortablePromise])).resolves.toBe('pending');
        resolve(123);
        await expect(abortablePromise).resolves.toBe(123);
    });
    it('pends when neither the promise has resolved nor the signal aborted', async () => {
        expect.assertions(1);
        const signal = new AbortController().signal;
        await expect(Promise.race(['pending', getAbortablePromise(promise, signal)])).resolves.toBe('pending');
    });
});
