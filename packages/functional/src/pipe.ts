import { BaseTransaction } from '@solana/transactions';

type Func<T, R> = (a: T) => R;

type Chain<T, R, F extends Func<T, R>[]> = F extends []
    ? T
    : F extends [Func<infer U, infer V>, ...infer Rest]
    ? T extends U
        ? V & Chain<T, R, Rest extends Func<T, R>[] ? Rest : []>
        : never
    : never;

/**
 * General pipe function.
 * Provide an initial value and a list of functions to pipe it through.
 * @param a     The initial value
 * @param fns   Any number of functions to pipe the value through
 * @returns     The final value with all functions applied
 */
export function pipe<T, R, F extends Func<T, R>[]>(a: T, ...fns: F) {
    return fns.reduce((acc, fn) => {
        return { ...acc, ...fn(acc) };
    }, a as Chain<T, R, F>);
}

/**
 * Pipe for creating transactions.
 * This function drives the general `pipe` function, but provides type safety for
 * working with transactions.
 * @param baseTransaction   The initial transaction, which can be any type of transaction
 * @param mutations         Any number of mutating functions to pipe the transaction through
 * @returns                 The final transaction with all mutations applied
 */
export function pipeTransaction<T extends BaseTransaction, R extends BaseTransaction, F extends Func<T, R>[]>(
    baseTransaction: T,
    ...mutations: F
): Chain<T, R, F> {
    return pipe(baseTransaction, ...mutations);
}
