/**
 * Transforms a value into a JSON string, whilst rendering bigints as large unsafe integers.
 */
export function stringifyJsonWithBigints(value: unknown, space?: number | string): string {
    return unwrapBigIntValueObject(
        JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? wrapBigIntValueObject(v) : v), space),
    );
}

type BigIntValueObject = {
    // `$` implies 'this is a value object'.
    // `n` implies 'interpret the value as a bigint'.
    $n: string;
};

function wrapBigIntValueObject(value: bigint): BigIntValueObject {
    return { $n: `${value}` };
}

function unwrapBigIntValueObject(value: string): string {
    return value.replace(/\{\s*"\$n"\s*:\s*"(-?\d+)"\s*\}/g, '$1');
}
