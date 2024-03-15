import { isFixedSize } from '@solana/codecs-core';

/**
 * Functionally, this type helper is equivalent to the identity type — i.e. `type Identity<T> = T`.
 * However, wrapping generic object mappings in this type significantly reduces the number
 * of instantiation expressions processed, which increases TypeScript performance and
 * prevents "Type instantiation is excessively deep and possibly infinite" errors.
 *
 * This works because TypeScript doesn't create a new level of nesting when encountering conditional generic types.
 * @see https://github.com/microsoft/TypeScript/issues/34933
 * @see https://github.com/kysely-org/kysely/pull/483
 */
export type DrainOuterGeneric<T> = [T] extends [unknown] ? T : never;

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
