export class NumberOutOfRangeCodecError extends RangeError {
    readonly name: string = 'NumberOutOfRangeCodecError';

    constructor(codecName: string, min: number | bigint, max: number | bigint, actual: number | bigint) {
        super(`Codec [${codecName}] expected number to be between ${min} and ${max}, got ${actual}.`);
    }
}
