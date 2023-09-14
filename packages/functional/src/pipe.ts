/**
 * General pipe function.
 * Provide an initial value and a list of functions to pipe it through.
 * @param init  The initial value
 * @param fns   Any number of functions to pipe the value through
 * @returns     The final value with all functions applied
 */
export function pipe<TInitial>(init: TInitial): TInitial;
export function pipe<TInitial, R1>(init: TInitial, init_r1: (init: TInitial) => R1): R1;
export function pipe<TInitial, R1, R2>(init: TInitial, init_r1: (init: TInitial) => R1, r1_r2: (r1: R1) => R2): R2;
export function pipe<TInitial, R1, R2, R3>(
    init: TInitial,
    init_r1: (init: TInitial) => R1,
    r1_r2: (r1: R1) => R2,
    r2_r3: (r2: R2) => R3
): R3;
export function pipe<TInitial, R1, R2, R3, R4>(
    init: TInitial,
    init_r1: (init: TInitial) => R1,
    r1_r2: (r1: R1) => R2,
    r2_r3: (r2: R2) => R3,
    r3_r4: (r3: R3) => R4
): R4;
export function pipe<TInitial>(init: TInitial, ...fns: CallableFunction[]) {
    return fns.reduce((acc, fn) => ({ ...acc, ...fn(acc) }), init);
}
