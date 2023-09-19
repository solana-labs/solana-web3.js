export class InvalidBaseStringError extends Error {
    readonly name: string = 'InvalidBaseStringError';

    readonly cause?: Error;

    constructor(value: string, base: number, cause?: Error) {
        const message = `Expected a string of base ${base}, got [${value}].`;
        super(message);
        this.cause = cause;
    }
}
