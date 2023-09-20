/** Returns the max size or null if at least one size is null. */
export function maxCodecSizes(sizes: (number | null)[]): number | null {
    return sizes.reduce(
        (all, size) => (all === null || size === null ? null : Math.max(all, size)),
        0 as number | null
    );
}

/** Returns the sum of all sizes or null if at least one size is null. */
export function sumCodecSizes(sizes: (number | null)[]): number | null {
    return sizes.reduce((all, size) => (all === null || size === null ? null : all + size), 0 as number | null);
}
