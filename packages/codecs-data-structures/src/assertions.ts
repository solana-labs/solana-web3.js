/** Checks the number of items in an array-like structure is expected. */
export function assertValidNumberOfItemsForCodec(
    codecDescription: string,
    expected: number | bigint,
    actual: number | bigint
) {
    if (expected !== actual) {
        // TODO: Coded error.
        throw new Error(`Expected [${codecDescription}] to have ${expected} items, got ${actual}.`);
    }
}
