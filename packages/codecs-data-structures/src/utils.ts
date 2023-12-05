import { isFixedSize } from '@solana/codecs-core';

export function maxCodecSizes(sizes: (number | null)[]): number | null {
    return sizes.reduce(
        (all, size) => (all === null || size === null ? null : Math.max(all, size)),
        0 as number | null,
    );
}

export function sumCodecSizes(sizes: (number | null)[]): number | null {
    return sizes.reduce((all, size) => (all === null || size === null ? null : all + size), 0 as number | null);
}

export function getFixedSize(codec: { fixedSize: number } | { maxSize?: number }): number | null {
    return isFixedSize(codec) ? codec.fixedSize : null;
}

export function getMaxSize(codec: { fixedSize: number } | { maxSize?: number }): number | null {
    return isFixedSize(codec) ? codec.fixedSize : codec.maxSize ?? null;
}
