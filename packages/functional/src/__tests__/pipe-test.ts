import { pipe } from '../pipe';

describe('pipe', () => {
    it('can pipe a single value', () => {
        expect.assertions(6);
        expect(pipe(true)).toBe(true);
        expect(pipe('test')).toBe('test');
        expect(pipe(1)).toBe(1);
        expect(pipe(3n)).toBe(3n);
        expect(pipe(null)).toBeNull();
        expect(pipe(undefined)).toBeUndefined();
    });
    it('can pipe a single function', () => {
        expect.assertions(1);
        expect(pipe('test', value => value.toUpperCase())).toBe('TEST');
    });
    it('can pipe multiple functions', () => {
        expect.assertions(3);
        expect(
            pipe(
                'test',
                value => value.toUpperCase(),
                value => value + '!',
                value => value.repeat(3)
            )
        ).toBe('TEST!TEST!TEST!');
        expect(
            pipe(
                1,
                value => value + 1,
                value => value + 2,
                value => value + 3
            )
        ).toBe(7);
        expect(
            pipe(
                1,
                value => value + 1,
                value => value * 2,
                value => value - 1
            )
        ).toBe(3);
    });
    it('can pipe multiple functions with different types', () => {
        expect.assertions(3);
        expect(
            pipe(
                1,
                value => value + 1,
                value => value.toString(),
                value => value + '!'
            )
        ).toBe('2!');
        expect(
            pipe(
                'test',
                value => value.toUpperCase(),
                value => value.length,
                value => value + 1
            )
        ).toBe(5);
        expect(
            pipe(
                1,
                value => value + 1,
                value => value * 2,
                value => value - 1,
                value => value.toString(),
                value => value + '!'
            )
        ).toBe('3!');
    });
    describe('combining objects', () => {
        function combine<T extends object, U extends object>(a: T, b: U): T & U {
            return { ...a, ...b };
        }
        it('can combine two objects', () => {
            expect.assertions(1);
            expect(pipe({ a: 1 }, value => combine(value, { b: 2 }))).toEqual({ a: 1, b: 2 });
        });
        it('can combine four objects', () => {
            expect.assertions(1);
            expect(
                pipe(
                    { a: 1 },
                    value => combine(value, { b: 2 }),
                    value => combine(value, { c: 3 }),
                    value => combine(value, { d: 4 })
                )
            ).toEqual({ a: 1, b: 2, c: 3, d: 4 });
        });
    });
    describe('combining arrays', () => {
        function combine<T>(a: T[], b: T[]): T[] {
            return [...a, ...b];
        }
        it('can combine two arrays', () => {
            expect.assertions(1);
            expect(pipe([1], value => combine(value, [2]))).toEqual([1, 2]);
        });
        it('can combine four arrays', () => {
            expect.assertions(1);
            expect(
                pipe(
                    [1],
                    value => combine(value, [2]),
                    value => combine(value, [3]),
                    value => combine(value, [4])
                )
            ).toEqual([1, 2, 3, 4]);
        });
    });
    describe('combining strings', () => {
        function combine(a: string, b: string): string {
            return a + b;
        }
        it('can combine two strings', () => {
            expect.assertions(1);
            expect(pipe('a', value => combine(value, 'b'))).toBe('ab');
        });
        it('can combine four strings', () => {
            expect.assertions(1);
            expect(
                pipe(
                    'a',
                    value => combine(value, 'b'),
                    value => combine(value, 'c'),
                    value => combine(value, 'd')
                )
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
            expect.assertions(1);
            expect(pipe({ a: 1 }, value => addOrAppend(value, 'test'))).toEqual({ a: 1, d: ['test'] });
        });
        it('can append to the array', () => {
            expect.assertions(1);
            expect(pipe({ a: 1, d: ['test'] }, value => addOrAppend(value, 'test'))).toEqual({
                a: 1,
                d: ['test', 'test'],
            });
        });
        it('can create and append to the array', () => {
            expect.assertions(1);
            expect(
                pipe(
                    { a: 1, b: 'test' },
                    value => addOrAppend(value, 'test'),
                    value => addOrAppend(value, 'test again')
                )
            ).toEqual({
                a: 1,
                b: 'test',
                d: ['test', 'test again'],
            });
        });
        it('can create and append to the array multiple times', () => {
            expect.assertions(1);
            expect(
                pipe(
                    { a: 1, b: 'test' },
                    value => addOrAppend(value, 'test'),
                    value => addOrAppend(value, 'test again'),
                    value => addOrAppend(value, 'test again'),
                    value => addOrAppend(value, 'test again')
                )
            ).toEqual({
                a: 1,
                b: 'test',
                d: ['test', 'test again', 'test again', 'test again'],
            });
        });
        it('can create the array, do some other operations, then append to the array', () => {
            expect.assertions(1);
            expect(
                pipe(
                    { a: 1, b: 'test' },
                    value => addOrAppend(value, 'test'),
                    value => addOrAppend(value, 'test again'),
                    value => ({ ...value, b: value.b + '!' }),
                    value => addOrAppend(value, 'test again')
                )
            ).toEqual({
                a: 1,
                b: 'test!',
                d: ['test', 'test again', 'test again'],
            });
        });
        it('can create the array, append to it, do some other operations, then drop it', () => {
            expect.assertions(1);
            expect(
                pipe(
                    { a: 1, b: 'test' },
                    value => addOrAppend(value, 'test'),
                    value => addOrAppend(value, 'test again'),
                    value => ({ ...value, b: value.b + '!' }),
                    value => dropArray(value)
                )
            ).toEqual({
                a: 1,
                b: 'test!',
            });
        });
        it('can create the array, append to it, do some other operations, then drop it, then create/append to it again', () => {
            expect.assertions(1);
            expect(
                pipe(
                    { a: 1, b: 'test' },
                    value => addOrAppend(value, 'test'),
                    value => addOrAppend(value, 'test again'),
                    value => ({ ...value, b: value.b + '!' }),
                    value => dropArray(value),
                    value => addOrAppend(value, 'test again')
                )
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
            expect.assertions(1);
            expect(() => pipe('init', throws)).toThrow('test error');
        });
        it('can capture errors with multiple throws', () => {
            expect.assertions(1);
            expect(() => pipe('init', throws, throws, throws)).toThrow('test error');
        });
        it('can capture errors when throw occurs early in pipe', () => {
            expect.assertions(1);
            expect(() =>
                pipe(
                    'init',
                    throws,
                    value => value.toUpperCase(),
                    value => value + '!',
                    value => value.repeat(3)
                )
            ).toThrow('test error');
        });
    });
});
