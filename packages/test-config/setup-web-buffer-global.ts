/**
 * Browsers don't have a `Buffer` global, so delete it now.
 */
beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete globalThis.Buffer;
});
