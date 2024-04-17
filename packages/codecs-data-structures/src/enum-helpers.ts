/**
 * Defines the "lookup object" of an enum.
 *
 * @example
 * ```ts
 * enum Direction { Left, Right };
 * ```
 */
export type EnumLookupObject = { [key: string]: number | string };

/**
 * Returns the allowed input for an enum.
 *
 * @example
 * ```ts
 * enum Direction { Left, Right };
 * type DirectionInput = GetEnumFrom<Direction>; // "Left" | "Right" | 0 | 1
 * ```
 */
export type GetEnumFrom<TEnum extends EnumLookupObject> = TEnum[keyof TEnum] | keyof TEnum;

/**
 * Returns all the available variants of an enum.
 *
 * @example
 * ```ts
 * enum Direction { Left, Right };
 * type DirectionOutput = GetEnumTo<Direction>; // 0 | 1
 * ```
 */
export type GetEnumTo<TEnum extends EnumLookupObject> = TEnum[keyof TEnum];

export function getEnumStats(constructor: EnumLookupObject) {
    const numericalValues = [
        ...new Set(Object.values(constructor).filter(v => typeof v === 'number') as number[]),
    ].sort();
    const enumRecord = Object.fromEntries(Object.entries(constructor).slice(numericalValues.length)) as Record<
        string,
        number | string
    >;
    const enumKeys = Object.keys(enumRecord);
    const enumValues = Object.values(enumRecord);
    const stringValues: string[] = [
        ...new Set([...enumKeys, ...enumValues.filter((v): v is string => typeof v === 'string')]),
    ];

    return { enumKeys, enumRecord, enumValues, numericalValues, stringValues };
}

export function getEnumIndexFromVariant({
    enumKeys,
    enumValues,
    variant,
}: {
    enumKeys: string[];
    enumValues: (number | string)[];
    variant: number | string | symbol;
}): number {
    const valueIndex = findLastIndex(enumValues, value => value === variant);
    if (valueIndex >= 0) return valueIndex;
    return enumKeys.findIndex(key => key === variant);
}

export function getEnumIndexFromDiscriminator({
    discriminator,
    enumKeys,
    enumValues,
    useValuesAsDiscriminators,
}: {
    discriminator: number;
    enumKeys: string[];
    enumValues: (number | string)[];
    useValuesAsDiscriminators: boolean;
}): number {
    if (!useValuesAsDiscriminators) {
        return discriminator >= 0 && discriminator < enumKeys.length ? discriminator : -1;
    }
    return findLastIndex(enumValues, value => value === discriminator);
}

function findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array)) return l;
    }
    return -1;
}

export function formatNumericalValues(values: number[]): string {
    if (values.length === 0) return '';
    let range: [number, number] = [values[0], values[0]];
    const ranges: string[] = [];
    for (let index = 1; index < values.length; index++) {
        const value = values[index];
        if (range[1] + 1 === value) {
            range[1] = value;
        } else {
            ranges.push(range[0] === range[1] ? `${range[0]}` : `${range[0]}-${range[1]}`);
            range = [value, value];
        }
    }
    ranges.push(range[0] === range[1] ? `${range[0]}` : `${range[0]}-${range[1]}`);
    return ranges.join(', ');
}
