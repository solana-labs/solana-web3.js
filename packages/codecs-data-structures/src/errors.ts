export class InvalidNumberOfItemsCodecError extends Error {
    readonly name = 'InvalidNumberOfItemsCodecError';

    constructor(codecName: string, expected: number | bigint, actual: number | bigint) {
        super(`Expected [${codecName}] to have ${expected} items, got ${actual}.`);
    }
}

export class InvalidArrayLikeRemainderSizeCodecError extends Error {
    readonly name = 'InvalidArrayLikeRemainderSizeCodecError';

    constructor(remainderSize: number | bigint, itemSize: number | bigint) {
        super(
            `The remainder of the buffer (${remainderSize} bytes) cannot be split into chunks of ${itemSize} bytes. ` +
                `Codecs of "remainder" size must have a remainder that is a multiple of its item size. ` +
                `In other words, ${remainderSize} modulo ${itemSize} should be equal to zero.`
        );
    }
}

export class UnrecognizedArrayLikeCodecSizeError extends Error {
    readonly name = 'UnrecognizedArrayLikeCodecSizeError';

    constructor(size: never) {
        super(`Unrecognized array-like codec size: ${JSON.stringify(size)}`);
    }
}

export class InvalidDataEnumVariantError extends Error {
    readonly name = 'InvalidDataEnumVariantError';

    constructor(invalidVariant: string, validVariants: string[]) {
        super(
            `Invalid data enum variant. ` +
                `Expected one of [${validVariants.join(', ')}], ` +
                `got "${invalidVariant}".`
        );
    }
}

export class InvalidScalarEnumVariantError extends Error {
    readonly name = 'InvalidScalarEnumVariantError';

    constructor(
        invalidVariant: string | number | bigint,
        validVariants: string[],
        min: number | bigint,
        max: number | bigint
    ) {
        super(
            `Invalid scalar enum variant. ` +
                `Expected one of [${validVariants.join(', ')}] ` +
                `or a number between ${min} and ${max}, ` +
                `got "${invalidVariant}".`
        );
    }
}

export class EnumDiscriminatorOutOfRangeError extends RangeError {
    readonly name = 'EnumDiscriminatorOutOfRangeError';

    constructor(discriminator: number | bigint, min: number | bigint, max: number | bigint) {
        super(
            `Enum discriminator out of range. ` + `Expected a number between ${min} and ${max}, got ${discriminator}.`
        );
    }
}
