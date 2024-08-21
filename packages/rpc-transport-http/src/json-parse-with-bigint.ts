/**
 * This function is a replacement for `JSON.parse` that can handle large integers by
 * parsing them as BigInts. It will only transform integers that are too large to be
 * represented as a regular JavaScript number.
 */
export function jsonParseWithLargeIntegersAsBigInts(
    json: string,
    wrap: (json: string) => string = wrapLargeIntegers,
): unknown {
    return JSON.parse(wrap(json), (_, value) => {
        return isBigIntValueObject(value) ? unwrapBigIntValueObject(value) : value;
    });
}

/**
 * This function takes a JSON string and wraps any large,
 * unsafe integers in `BigIntValueObjects` that can then
 * be recognized and unwrapped by a `JSON.parse` reviver.
 */
export function wrapLargeIntegers(json: string): string {
    return wrapLargeIntegersUsingParser(json, consumeNumberUsingParser);
}

export function wrapLargeIntegersUsingParser(
    json: string,
    consumeNumber: (json: string, ii: number) => string | null,
): string {
    const out = [];
    let inQuote = false;
    for (let ii = 0; ii < json.length; ii++) {
        let isEscaped = false;
        if (json[ii] === '\\') {
            out.push(json[ii++]);
            isEscaped = !isEscaped;
        }
        if (json[ii] === '"') {
            out.push(json[ii++]);
            if (!isEscaped) {
                inQuote = !inQuote;
            }
        }
        if (!inQuote) {
            const consumedNumber = consumeNumber(json, ii);
            if (consumedNumber?.length) {
                ii += consumedNumber.length;
                if (consumedNumber.match(/\.|[eE]-/) || Number.isSafeInteger(Number(consumedNumber))) {
                    out.push(consumedNumber);
                } else {
                    out.push(wrapBigIntValueObject(consumedNumber));
                }
            }
        }
        out.push(json[ii]);
    }

    return out.join('');
}

export function wrapLargeIntegersUsingParserAndRegex(json: string): string {
    return wrapLargeIntegersUsingParser(json, consumeNumberUsingRegex);
}

function consumeNumberUsingRegex(json: string, ii: number): string | null {
    /** @see https://stackoverflow.com/a/13340826/11440277 */
    const JSON_NUMBER_REGEX = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/;

    // Stop early if the first character isn't a digit or a minus sign.
    if (!json[ii]?.match(/[-\d]/)) {
        return null;
    }

    // Otherwise, check if the next characters form a valid JSON number.
    const numberMatch = json.slice(ii).match(JSON_NUMBER_REGEX);
    return numberMatch ? numberMatch[0] : null;
}

function consumeNumberUsingParser(json: string, ii: number): string | null {
    /** @see https://stackoverflow.com/a/13340826/11440277 */
    const consumed = [];

    // Consume the optional negative sign.
    if (json[ii] === '-') {
        consumed.push(json[ii++]);
    }

    // Consume the units.
    if (json[ii] === '0') {
        consumed.push(json[ii++]);
    } else if (json[ii]?.match(/[1-9]/)) {
        consumed.push(json[ii++]);
        while (json[ii]?.match(/\d/)) {
            consumed.push(json[ii++]);
        }
    } else {
        return null;
    }

    // Consume the optional decimals.
    if (json[ii] === '.') {
        consumed.push(json[ii++]);
        if (!json[ii]?.match(/\d/)) {
            return null;
        }
        while (json[ii]?.match(/\d/)) {
            consumed.push(json[ii++]);
        }
    }

    // Consume the optional exponent.
    if (json[ii] === 'e' || json[ii] === 'E') {
        consumed.push(json[ii++]);
        if (json[ii] === '+' || json[ii] === '-') {
            consumed.push(json[ii++]);
        }
        if (!json[ii]?.match(/\d/)) {
            return null;
        }
        while (json[ii]?.match(/\d/)) {
            consumed.push(json[ii++]);
        }
    }

    return consumed.join('');
}

export function wrapLargeIntegersUsingRegex(json: string): string {
    return transformUnquotedSegments(json, unquotedSegment => {
        return unquotedSegment.replaceAll(/(-?\d+)/g, (_, value: string) => {
            return Number.isSafeInteger(Number(value)) ? value : wrapBigIntValueObject(value);
        });
    });
}

/**
 * This function takes a JSON string and transforms any unquoted segments using the provided
 * `transform` function. This means we can be sure that our transformations will never occur
 * inside a double quoted string — even if it contains escaped double quotes.
 */
function transformUnquotedSegments(json: string, transform: (value: string) => string): string {
    /**
     * This regex matches any part of a JSON string that isn't wrapped in double quotes.
     *
     * For instance, in the string `{"age":42,"name":"Alice \"The\" 2nd"}`, it would the
     * following parts: `{`, `:42,`, `:`, `}`. Notice the whole "Alice \"The\" 2nd" string
     * is not matched as it is wrapped in double quotes and contains escaped double quotes.
     *
     * The regex is composed of two parts:
     *
     *   1. The first part `^([^"]+)` matches any character until we reach the first double quote.
     *   2. The second part `("(?:\\"|[^"])+")([^"]+)` matches any double quoted string that may exist
     *      after the first part and any unquoted segment that follows it. To match a double quoted string,
     *      we use the `(?:\\"|[^"])` regex to match any character that isn't a double quote whilst allowing
     *      escaped double quotes.
     */
    const unquotedSegmentsRegex = /^([^"]+)|("(?:\\"|[^"])+")([^"]+)/g;

    return json.replaceAll(unquotedSegmentsRegex, (_, firstGroup, secondGroup, thirdGroup) => {
        // If the first group is matched, it means we are at the
        // beginning of the JSON string and we have an unquoted segment.
        if (firstGroup) return transform(firstGroup);

        // Otherwise, we have a double quoted string followed by an unquoted segment.
        return `${secondGroup}${transform(thirdGroup)}`;
    });
}

type BigIntValueObject = {
    // `$` implies 'this is a value object'.
    // `n` implies 'interpret the value as a bigint'.
    $n: string;
};

function wrapBigIntValueObject(value: string): string {
    return `{"$n":"${value}"}`;
}

function unwrapBigIntValueObject({ $n }: BigIntValueObject): bigint {
    if ($n.match(/[eE]/)) {
        const [units, exponent] = $n.split(/[eE]/);
        return BigInt(units) * BigInt(10) ** BigInt(exponent);
    }
    return BigInt($n);
}

function isBigIntValueObject(value: unknown): value is BigIntValueObject {
    return !!value && typeof value === 'object' && '$n' in value && typeof value.$n === 'string';
}
