import type { Address } from '@solana/addresses';

/**
 * Defines a Solana program.
 */
export type Program<TAddress extends string = string> = {
    /**
     * The base58 address of the program.
     */
    address: Address<TAddress>;

    /**
     * Retrieves a program-specific error from a given error code.
     */
    getErrorFromCode?: (code: number, cause?: Error) => Error;

    /**
     * A unique name for the Program.
     *
     * To avoid conflict with other organizations, it is recommended
     * to prefix the program name with a namespace that is unique to
     * your organization. For instance, programs belonging to the
     * Solana Program Library are prefixed with `spl` like so:
     * `splMemo` or `splToken`.
     */
    name: string;
};

/**
 * Defines a Solana program that can return custom errors from a provided error code.
 */
export type ProgramWithErrors<TErrorCode extends number = number, TError extends Error = Error> = {
    getErrorFromCode: (code: TErrorCode, cause?: Error) => TError;
};
