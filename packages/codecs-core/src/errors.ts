export class EmptyBufferCodecError extends Error {
    readonly name: string = 'EmptyBufferCodecError';

    constructor(codec: string) {
        super(`Codec [${codec}] cannot decode empty buffers.`);
    }
}

export class NotEnoughBytesCodecError extends Error {
    readonly name: string = 'NotEnoughBytesCodecError';

    constructor(codec: string, expected: bigint | number, actual: bigint | number) {
        super(`Codec [${codec}] expected ${expected} bytes, got ${actual}.`);
    }
}

export class ExpectedFixedSizeCodecError extends Error {
    readonly name: string = 'ExpectedFixedSizeCodecError';

    constructor(message?: string) {
        message ??= 'Expected a fixed-size codec, got a variable-size one.';
        super(message);
    }
}

export class IncompatibleEncoderAndDecoderError extends Error {
    readonly name: string = 'IncompatibleEncoderAndDecoderError';
}
