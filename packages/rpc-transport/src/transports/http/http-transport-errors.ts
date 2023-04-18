type SolanaHttpErrorDetails = Readonly<{
    statusCode: number;
    message: string;
}>;

export class SolanaHttpError extends Error {
    readonly statusCode: number;
    constructor(details: SolanaHttpErrorDetails) {
        super(`HTTP error (${details.statusCode}): ${details.message}`);
        Error.captureStackTrace(this, this.constructor);
        this.statusCode = details.statusCode;
    }
    get name() {
        return 'SolanaHttpError';
    }
}
