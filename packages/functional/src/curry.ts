/**
 * General curry function.
 *
 * The largest arity present in all `@solana` packages belongs to `pipe`,
 * which supports arity of 10. Thus `curry` also supports arity of 10.
 * @see https://github.com/solana-labs/solana-web3.js/blob/master/packages/functional/src/pipe.ts
 *
 * Using this function you can curry any function, binding any number of arguments.
 * ```typescript
 * // Using some defined function
 * const add = (a: number, b: number) => a + b;
 * // You can curry in one line
 * const sum = curry(add)(1, 2);    // 3
 * // Or you can curry with a variable
 * const addStuff = curry(add);
 * const sum = addStuff(1, 2);      // 3
 * // You can also bind some arguments
 * const addOne = curry(add, 1);
 * const sum = addOne(2);           // 3
 * // Or bind all arguments
 * const addOneAndTwo = curry(add, 1, 2);
 * const sum = addOneAndTwo();      // 3
 * ```
 * @param fn    The function to be curried
 * @param args  Any default arguments to bind to the function
 * @returns     The curried function
 */
export function curry<R>(fn: () => R): () => R;
// 1 arg
export function curry<A, R>(fn: (a: A) => R): (a: A) => R;
export function curry<A, R>(fn: (a: A) => R, a: A): () => R;
// 2 args
export function curry<A, B, R>(fn: (a: A, b: B) => R): (a: A, b: B) => R;
export function curry<A, B, R>(fn: (a: A, b: B) => R, a: A): (b: B) => R;
export function curry<A, B, R>(fn: (a: A, b: B) => R, a: A, b: B): () => R;
// 3 args
export function curry<A, B, C, R>(fn: (a: A, b: B, c: C) => R): (a: A, b: B, c: C) => R;
export function curry<A, B, C, R>(fn: (a: A, b: B, c: C) => R, a: A): (b: B, c: C) => R;
export function curry<A, B, C, R>(fn: (a: A, b: B, c: C) => R, a: A, b: B): (c: C) => R;
export function curry<A, B, C, R>(fn: (a: A, b: B, c: C) => R, a: A, b: B, c: C): () => R;
// 4 args
export function curry<A, B, C, D, R>(fn: (a: A, b: B, c: C, d: D) => R): (a: A, b: B, c: C, d: D) => R;
export function curry<A, B, C, D, R>(fn: (a: A, b: B, c: C, d: D) => R, a: A): (b: B, c: C, d: D) => R;
export function curry<A, B, C, D, R>(fn: (a: A, b: B, c: C, d: D) => R, a: A, b: B): (c: C, d: D) => R;
export function curry<A, B, C, D, R>(fn: (a: A, b: B, c: C, d: D) => R, a: A, b: B, c: C): (d: D) => R;
export function curry<A, B, C, D, R>(fn: (a: A, b: B, c: C, d: D) => R, a: A, b: B, c: C, d: D): () => R;
// 5 args
export function curry<A, B, C, D, E, R>(fn: (a: A, b: B, c: C, d: D, e: E) => R): (a: A, b: B, c: C, d: D, e: E) => R;
export function curry<A, B, C, D, E, R>(fn: (a: A, b: B, c: C, d: D, e: E) => R, a: A): (b: B, c: C, d: D, e: E) => R;
export function curry<A, B, C, D, E, R>(fn: (a: A, b: B, c: C, d: D, e: E) => R, a: A, b: B): (c: C, d: D, e: E) => R;
export function curry<A, B, C, D, E, R>(fn: (a: A, b: B, c: C, d: D, e: E) => R, a: A, b: B, c: C): (d: D, e: E) => R;
export function curry<A, B, C, D, E, R>(fn: (a: A, b: B, c: C, d: D, e: E) => R, a: A, b: B, c: C, d: D): (e: E) => R;
export function curry<A, B, C, D, E, R>(fn: (a: A, b: B, c: C, d: D, e: E) => R, a: A, b: B, c: C, d: D, e: E): () => R;
// 6 args
export function curry<A, B, C, D, E, F, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F) => R
): (a: A, b: B, c: C, d: D, e: E, f: F) => R;
export function curry<A, B, C, D, E, F, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F) => R,
    a: A
): (b: B, c: C, d: D, e: E, f: F) => R;
export function curry<A, B, C, D, E, F, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F) => R,
    a: A,
    b: B
): (c: C, d: D, e: E, f: F) => R;
export function curry<A, B, C, D, E, F, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F) => R,
    a: A,
    b: B,
    c: C
): (d: D, e: E, f: F) => R;
export function curry<A, B, C, D, E, F, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F) => R,
    a: A,
    b: B,
    c: C,
    d: D
): (e: E, f: F) => R;
export function curry<A, B, C, D, E, F, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
): (f: F) => R;
export function curry<A, B, C, D, E, F, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
): () => R;
// 7 args
export function curry<A, B, C, D, E, F, G, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R
): (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R;
export function curry<A, B, C, D, E, F, G, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R,
    a: A
): (b: B, c: C, d: D, e: E, f: F, g: G) => R;
export function curry<A, B, C, D, E, F, G, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R,
    a: A,
    b: B
): (c: C, d: D, e: E, f: F, g: G) => R;
export function curry<A, B, C, D, E, F, G, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R,
    a: A,
    b: B,
    c: C
): (d: D, e: E, f: F, g: G) => R;
export function curry<A, B, C, D, E, F, G, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R,
    a: A,
    b: B,
    c: C,
    d: D
): (e: E, f: F, g: G) => R;
export function curry<A, B, C, D, E, F, G, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
): (f: F, g: G) => R;
export function curry<A, B, C, D, E, F, G, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
): (g: G) => R;
export function curry<A, B, C, D, E, F, G, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
): () => R;
// 8 args
export function curry<A, B, C, D, E, F, G, H, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R
): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R;
export function curry<A, B, C, D, E, F, G, H, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R,
    a: A
): (b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R;
export function curry<A, B, C, D, E, F, G, H, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R,
    a: A,
    b: B
): (c: C, d: D, e: E, f: F, g: G, h: H) => R;
export function curry<A, B, C, D, E, F, G, H, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R,
    a: A,
    b: B,
    c: C
): (d: D, e: E, f: F, g: G, h: H) => R;
export function curry<A, B, C, D, E, F, G, H, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R,
    a: A,
    b: B,
    c: C,
    d: D
): (e: E, f: F, g: G, h: H) => R;
export function curry<A, B, C, D, E, F, G, H, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
): (f: F, g: G, h: H) => R;
export function curry<A, B, C, D, E, F, G, H, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
): (g: G, h: H) => R;
export function curry<A, B, C, D, E, F, G, H, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
): (h: H) => R;
export function curry<A, B, C, D, E, F, G, H, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G,
    h: H
): () => R;
// 9 args
export function curry<A, B, C, D, E, F, G, H, I, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R
): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R;
export function curry<A, B, C, D, E, F, G, H, I, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R,
    a: A
): (b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R;
export function curry<A, B, C, D, E, F, G, H, I, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R,
    a: A,
    b: B
): (c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R;
export function curry<A, B, C, D, E, F, G, H, I, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R,
    a: A,
    b: B,
    c: C
): (d: D, e: E, f: F, g: G, h: H, i: I) => R;
export function curry<A, B, C, D, E, F, G, H, I, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R,
    a: A,
    b: B,
    c: C,
    d: D
): (e: E, f: F, g: G, h: H, i: I) => R;
export function curry<A, B, C, D, E, F, G, H, I, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
): (f: F, g: G, h: H, i: I) => R;
export function curry<A, B, C, D, E, F, G, H, I, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
): (g: G, h: H, i: I) => R;
export function curry<A, B, C, D, E, F, G, H, I, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
): (h: H, i: I) => R;
export function curry<A, B, C, D, E, F, G, H, I, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G,
    h: H
): (i: I) => R;
export function curry<A, B, C, D, E, F, G, H, I, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G,
    h: H,
    i: I
): () => R;
// 10 args
export function curry<A, B, C, D, E, F, G, H, I, J, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R
): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R;
export function curry<A, B, C, D, E, F, G, H, I, J, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R,
    a: A
): (b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R;
export function curry<A, B, C, D, E, F, G, H, I, J, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R,
    a: A,
    b: B
): (c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R;
export function curry<A, B, C, D, E, F, G, H, I, J, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R,
    a: A,
    b: B,
    c: C
): (d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R;
export function curry<A, B, C, D, E, F, G, H, I, J, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R,
    a: A,
    b: B,
    c: C,
    d: D
): (e: E, f: F, g: G, h: H, i: I, j: J) => R;
export function curry<A, B, C, D, E, F, G, H, I, J, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
): (f: F, g: G, h: H, i: I, j: J) => R;
export function curry<A, B, C, D, E, F, G, H, I, J, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
): (g: G, h: H, i: I, j: J) => R;
export function curry<A, B, C, D, E, F, G, H, I, J, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
): (h: H, i: I, j: J) => R;
export function curry<A, B, C, D, E, F, G, H, I, J, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G,
    h: H
): (i: I, j: J) => R;
export function curry<A, B, C, D, E, F, G, H, I, J, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G,
    h: H,
    i: I
): (j: J) => R;
export function curry<A, B, C, D, E, F, G, H, I, J, R>(
    fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G,
    h: H,
    i: I,
    j: J
): () => R;
// Implementation
export function curry(fn: (...args: unknown[]) => unknown, ...args: unknown[]) {
    return fn.bind(null, ...args);
}
