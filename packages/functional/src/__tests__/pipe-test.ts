import { pipe } from '../pipe';

describe('pipe', () => {
    it('can pipe a single value', () => {
        expect(pipe(true)).toBe(true);
        expect(pipe('test')).toBe('test');
        expect(pipe(1)).toBe(1);
        expect(pipe(3n)).toBe(3n);
        expect(pipe(null)).toBeNull();
        expect(pipe(undefined)).toBeUndefined();
    });
    it('can pipe a single function', () => {
        expect(pipe('test', value => value.toUpperCase())).toBe('TEST');
    });
    it('can pipe multiple functions', () => {
        expect(
            pipe(
                'test',
                value => value.toUpperCase(),
                value => value + '!',
                value => value.repeat(3),
            ),
        ).toBe('TEST!TEST!TEST!');
        expect(
            pipe(
                1,
                value => value + 1,
                value => value + 2,
                value => value + 3,
            ),
        ).toBe(7);
        expect(
            pipe(
                1,
                value => value + 1,
                value => value * 2,
                value => value - 1,
            ),
        ).toBe(3);
    });
    it('can pipe multiple functions with different types', () => {
        expect(
            pipe(
                1,
                value => value + 1,
                value => value.toString(),
                value => value + '!',
            ),
        ).toBe('2!');
        expect(
            pipe(
                'test',
                value => value.toUpperCase(),
                value => value.length,
                value => value + 1,
            ),
        ).toBe(5);
        expect(
            pipe(
                1,
                value => value + 1,
                value => value * 2,
                value => value - 1,
                value => value.toString(),
                value => value + '!',
            ),
        ).toBe('3!');
    });
    describe('mutating objects', () => {
        it('will not mutate an object directly', () => {
            const startObj = {
                hello: 'world',
            };
            const endObj = pipe(startObj, obj => {
                obj.hello = 'there';
                return obj;
            });
            expect(startObj).toBe(endObj);
        });
        it('will mutate a cloned object', () => {
            const startObj = {
                hello: 'world',
            };
            const endObj = pipe(startObj, obj => {
                const newObj = { ...obj, hello: 'there' };
                return newObj;
            });
            expect(endObj).toMatchObject({ hello: 'there' });
        });
    });
    describe('combining objects', () => {
        function combine<T extends object, U extends object>(a: T, b: U): T & U {
            return { ...a, ...b };
        }
        it('can combine two objects', () => {
            expect(pipe({ a: 1 }, value => combine(value, { b: 2 }))).toEqual({ a: 1, b: 2 });
        });
        it('can combine four objects', () => {
            expect(
                pipe(
                    { a: 1 },
                    value => combine(value, { b: 2 }),
                    value => combine(value, { c: 3 }),
                    value => combine(value, { d: 4 }),
                ),
            ).toEqual({ a: 1, b: 2, c: 3, d: 4 });
        });
    });
    describe('combining arrays', () => {
        function combine<T>(a: T[], b: T[]): T[] {
            return [...a, ...b];
        }
        it('can combine two arrays', () => {
            expect(pipe([1], value => combine(value, [2]))).toEqual([1, 2]);
        });
        it('can combine four arrays', () => {
            expect(
                pipe(
                    [1],
                    value => combine(value, [2]),
                    value => combine(value, [3]),
                    value => combine(value, [4]),
                ),
            ).toEqual([1, 2, 3, 4]);
        });
    });
    describe('combining strings', () => {
        function combine(a: string, b: string): string {
            return a + b;
        }
        it('can combine two strings', () => {
            expect(pipe('a', value => combine(value, 'b'))).toBe('ab');
        });
        it('can combine four strings', () => {
            expect(
                pipe(
                    'a',
                    value => combine(value, 'b'),
                    value => combine(value, 'c'),
                    value => combine(value, 'd'),
                ),
            ).toBe('abcd');
        });
    });
    describe('appending or creating arrays on objects', () => {
        function addOrAppend(obj: { a: number; b?: string; c?: boolean; d?: string[] }, value: string) {
            if (obj.d) {
                return { ...obj, d: [...obj.d, value] };
            } else {
                return { ...obj, d: [value] };
            }
        }
        function dropArray(obj: { a: number; b?: string; c?: boolean; d?: string[] }) {
            if (obj.d) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { d, ...rest } = obj;
                return rest;
            } else {
                return obj;
            }
        }
        it('can create the array', () => {
            expect(pipe({ a: 1 }, value => addOrAppend(value, 'test'))).toEqual({ a: 1, d: ['test'] });
        });
        it('can append to the array', () => {
            expect(pipe({ a: 1, d: ['test'] }, value => addOrAppend(value, 'test'))).toEqual({
                a: 1,
                d: ['test', 'test'],
            });
        });
        it('can create and append to the array', () => {
            expect(
                pipe(
                    { a: 1, b: 'test' },
                    value => addOrAppend(value, 'test'),
                    value => addOrAppend(value, 'test again'),
                ),
            ).toEqual({
                a: 1,
                b: 'test',
                d: ['test', 'test again'],
            });
        });
        it('can create and append to the array multiple times', () => {
            expect(
                pipe(
                    { a: 1, b: 'test' },
                    value => addOrAppend(value, 'test'),
                    value => addOrAppend(value, 'test again'),
                    value => addOrAppend(value, 'test again'),
                    value => addOrAppend(value, 'test again'),
                ),
            ).toEqual({
                a: 1,
                b: 'test',
                d: ['test', 'test again', 'test again', 'test again'],
            });
        });
        it('can create the array, do some other operations, then append to the array', () => {
            expect(
                pipe(
                    { a: 1, b: 'test' },
                    value => addOrAppend(value, 'test'),
                    value => addOrAppend(value, 'test again'),
                    value => ({ ...value, b: value.b + '!' }),
                    value => addOrAppend(value, 'test again'),
                ),
            ).toEqual({
                a: 1,
                b: 'test!',
                d: ['test', 'test again', 'test again'],
            });
        });
        it('can create the array, append to it, do some other operations, then drop it', () => {
            expect(
                pipe(
                    { a: 1, b: 'test' },
                    value => addOrAppend(value, 'test'),
                    value => addOrAppend(value, 'test again'),
                    value => ({ ...value, b: value.b + '!' }),
                    value => dropArray(value),
                ),
            ).toEqual({
                a: 1,
                b: 'test!',
            });
        });
        it('can create the array, append to it, do some other operations, then drop it, then create/append to it again', () => {
            expect(
                pipe(
                    { a: 1, b: 'test' },
                    value => addOrAppend(value, 'test'),
                    value => addOrAppend(value, 'test again'),
                    value => ({ ...value, b: value.b + '!' }),
                    value => dropArray(value),
                    value => addOrAppend(value, 'test again'),
                ),
            ).toEqual({
                a: 1,
                b: 'test!',
                d: ['test again'],
            });
        });
    });
    describe('capturing errors', () => {
        function throws(_a: string): string {
            throw new Error('test error');
        }
        it('can capture errors', () => {
            expect(() => pipe('init', throws)).toThrow('test error');
        });
        it('can capture errors with multiple throws', () => {
            expect(() => pipe('init', throws, throws, throws)).toThrow('test error');
        });
        it('can capture errors when throw occurs early in pipe', () => {
            expect(() =>
                pipe(
                    'init',
                    throws,
                    value => value.toUpperCase(),
                    value => value + '!',
                    value => value.repeat(3),
                ),
            ).toThrow('test error');
        });
    });
    describe('nested pipes', () => {
        it('can pipe a single value from a nested pipe of a single value', () => {
            expect(pipe(pipe(pipe(1)))).toBe(1);
        });
        it('can pipe a single value from a nested pipe of multiple functions', () => {
            expect(
                pipe(
                    pipe(
                        pipe(
                            1,
                            value => value + 1,
                            value => value * 2,
                            value => value - 1,
                        ),
                    ),
                ),
            ).toBe(3);
        });
        it('can pipe multiple functions on a nested pipe of multiple functions', () => {
            expect(
                pipe(
                    pipe(
                        pipe(
                            1,
                            value => value + 1,
                            value => value * 2,
                            value => value - 1,
                        ),
                    ),
                    value => value.toString(),
                    value => value + '!',
                ),
            ).toBe('3!');
        });
        it('can pipe an initial value through multiple functions, apply a nested pipe of multiple functions, then apply more functions', () => {
            expect(
                pipe(
                    1,
                    value => value + 1,
                    value => value * 2,
                    value => value - 1,
                    value =>
                        pipe(
                            value,
                            value => value.toString(),
                            value => value + '!',
                        ),
                    value => value + '##',
                    value => value.repeat(2),
                ),
            ).toBe('3!##3!##');
        });
    });
    it('can pipe an initial object through multiple functions, apply a nested pipe of multiple functions, then apply more functions', () => {
        expect(
            pipe(
                { a: 1 },
                value => ({ ...value, b: 2 }),
                value => ({ ...value, c: 3 }),
                value => ({ ...value, d: 4 }),
                value =>
                    pipe(
                        value,
                        value => ({ ...value, e: 5 }),
                        value => ({ ...value, f: 6 }),
                        value => ({ ...value, g: 7 }),
                    ),
                value => ({ ...value, h: 8 }),
                value => ({ ...value, i: 9 }),
                value => ({ ...value, j: 10 }),
            ),
        ).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 });
    });
    it('can pipe an initial object through multiple functions, apply a nested pipe of multiple functions to one field, then apply more functions', () => {
        expect(
            pipe(
                { a: 1 },
                value => ({ ...value, b: 2 }),
                value => ({ ...value, c: 3 }),
                value => ({
                    ...value,
                    d: pipe(
                        [] as string[],
                        d => {
                            d.push('test');
                            return d;
                        },
                        d => {
                            d.push('test again');
                            return d;
                        },
                        d => {
                            d.push('test a third time');
                            return d;
                        },
                    ),
                }),
                value => ({ ...value, e: 5 }),
                value => ({ ...value, f: 6 }),
                value => ({ ...value, g: 7 }),
            ),
        ).toEqual({
            a: 1,
            b: 2,
            c: 3,
            d: ['test', 'test again', 'test a third time'],
            e: 5,
            f: 6,
            g: 7,
        });
    });
});
