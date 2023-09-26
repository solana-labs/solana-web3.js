import { curry } from '../curry';

describe('curry', () => {
    describe('basic functions with 1 argument', () => {
        const upper = (a: string) => a.toUpperCase();
        it('can curry a function without binding any arguments', () => {
            const curriedUpper = curry(upper);
            expect(curriedUpper('hello')).toBe('HELLO');
        });
        it('can curry a function and bind all arguments', () => {
            const curriedUpper = curry(upper, 'hello');
            expect(curriedUpper()).toBe('HELLO');
        });
        it('can call the curried function multiple times', () => {
            const curriedUpper = curry(upper);
            expect(curriedUpper('hello')).toBe('HELLO');
            expect(curriedUpper('world')).toBe('WORLD');
            expect(curriedUpper('again')).toBe('AGAIN');
        });
    });
    describe('basic functions with 2 arguments', () => {
        const concat = (a: string, b: string) => a + b;
        it('can curry a function without binding any arguments', () => {
            const curriedConcat = curry(concat);
            expect(curriedConcat('hello', 'world')).toBe('helloworld');
        });
        it('can curry a function and bind 1 argument', () => {
            const curriedConcat = curry(concat, 'hello');
            expect(curriedConcat('world')).toBe('helloworld');
        });
        it('can curry a function and bind all arguments', () => {
            const curriedConcat = curry(concat, 'hello', 'world');
            expect(curriedConcat()).toBe('helloworld');
        });
        it('can call the curried function multiple times', () => {
            const curriedConcat = curry(concat);
            expect(curriedConcat('hello', 'world')).toBe('helloworld');
            expect(curriedConcat('again', ' and again')).toBe('again and again');
            expect(curriedConcat('over', ' and over')).toBe('over and over');
        });
    });
    describe('basic functions with 5 arguments', () => {
        const concat = (a: string, b: string, c: string, d: string, e: string) => a + b + c + d + e;
        it('can curry a function without binding any arguments', () => {
            const curriedConcat = curry(concat);
            expect(curriedConcat('h', 'e', 'l', 'l', 'o')).toBe('hello');
        });
        it('can curry a function and bind 1 argument', () => {
            const curriedConcat = curry(concat, 'h');
            expect(curriedConcat('e', 'l', 'l', 'o')).toBe('hello');
        });
        it('can curry a function and bind 2 arguments', () => {
            const curriedConcat = curry(concat, 'h', 'e');
            expect(curriedConcat('l', 'l', 'o')).toBe('hello');
        });
        it('can curry a function and bind 3 arguments', () => {
            const curriedConcat = curry(concat, 'h', 'e', 'l');
            expect(curriedConcat('l', 'o')).toBe('hello');
        });
        it('can curry a function and bind 4 arguments', () => {
            const curriedConcat = curry(concat, 'h', 'e', 'l', 'l');
            expect(curriedConcat('o')).toBe('hello');
        });
        it('can curry a function and bind all arguments', () => {
            const curriedConcat = curry(concat, 'h', 'e', 'l', 'l', 'o');
            expect(curriedConcat()).toBe('hello');
        });
    });
    describe('mutating objects', () => {
        const mutate = (obj: { a: number; b: number }) => {
            obj.a = 1;
            obj.b = 2;
            return obj;
        };
        it('can curry a function without binding any arguments', () => {
            const curriedMutate = curry(mutate);
            const obj = { a: 0, b: 0 };
            expect(curriedMutate(obj)).toEqual({ a: 1, b: 2 });
        });
        it('can curry a function and bind 1 argument', () => {
            const curriedMutate = curry(mutate, { a: 0, b: 0 });
            expect(curriedMutate()).toEqual({ a: 1, b: 2 });
        });
    });
    describe('combining objects', () => {
        const combine = (a: { a: number }, b: { b: number }) => ({ ...a, ...b });
        it('can curry a function without binding any arguments', () => {
            const curriedCombine = curry(combine);
            expect(curriedCombine({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
        });
        it('can curry a function and bind 1 argument', () => {
            const curriedCombine = curry(combine, { a: 1 });
            expect(curriedCombine({ b: 2 })).toEqual({ a: 1, b: 2 });
        });
        it('can curry a function and bind all arguments', () => {
            const curriedCombine = curry(combine, { a: 1 }, { b: 2 });
            expect(curriedCombine()).toEqual({ a: 1, b: 2 });
        });
    });
    describe('combining arrays', () => {
        const combine = (a: number[], b: number[]) => [...a, ...b];
        it('can curry a function without binding any arguments', () => {
            const curriedCombine = curry(combine);
            expect(curriedCombine([1], [2])).toEqual([1, 2]);
        });
        it('can curry a function and bind 1 argument', () => {
            const curriedCombine = curry(combine, [1]);
            expect(curriedCombine([2])).toEqual([1, 2]);
        });
        it('can curry a function and bind all arguments', () => {
            const curriedCombine = curry(combine, [1], [2]);
            expect(curriedCombine()).toEqual([1, 2]);
        });
    });
    describe('combining strings', () => {
        const combine = (a: string, b: string) => a + b;
        it('can curry a function without binding any arguments', () => {
            const curriedCombine = curry(combine);
            expect(curriedCombine('hello', 'world')).toBe('helloworld');
        });
        it('can curry a function and bind 1 argument', () => {
            const curriedCombine = curry(combine, 'hello');
            expect(curriedCombine('world')).toBe('helloworld');
        });
        it('can curry a function and bind all arguments', () => {
            const curriedCombine = curry(combine, 'hello', 'world');
            expect(curriedCombine()).toBe('helloworld');
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
        it('can curry an array appending function without binding any arguments', () => {
            const curriedAddOrAppend = curry(addOrAppend);
            expect(curriedAddOrAppend({ a: 1 }, 'hello')).toEqual({ a: 1, d: ['hello'] });
        });
        it('can curry an array appending function and bind the initial object', () => {
            const curriedAddOrAppend = curry(addOrAppend, { a: 1 });
            expect(curriedAddOrAppend('hello')).toEqual({ a: 1, d: ['hello'] });
            expect(curriedAddOrAppend('world')).toEqual({ a: 1, d: ['world'] });
        });
        it('can curry an array dropping function without binding any arguments', () => {
            const curriedDrop = curry(dropArray);
            expect(curriedDrop({ a: 1, d: ['hello'] })).toEqual({ a: 1 });
        });
        it('can curry an array dropping function and bind the initial object', () => {
            const curriedDrop = curry(dropArray, { a: 1, d: ['hello'] });
            expect(curriedDrop()).toEqual({ a: 1 });
        });
    });
    describe('capturing errors', () => {
        const error = (a: string) => {
            throw new Error(a);
        };
        it('can curry a function without binding any arguments', () => {
            const curriedError = curry(error);
            expect(() => curriedError('test error')).toThrow('test error');
        });
        it('can curry a function and bind all arguments', () => {
            const curriedError = curry(error, 'test error');
            expect(() => curriedError()).toThrow('test error');
        });
    });
    describe('nested curries', () => {
        const capitalize = (a: string) => a.toUpperCase();
        const concat = (a: string, b: string) => a + b;
        it('can curry a function without binding any arguments', () => {
            const curriedConcat = curry(concat);
            const curriedCapitalize = curry(capitalize);
            expect(curriedConcat(curriedCapitalize('hello'), 'world')).toBe('HELLOworld');
        });
        it('can curry a function and bind 1 argument', () => {
            const curriedConcat = curry(concat, 'hello');
            const curriedCapitalize = curry(capitalize);
            expect(curriedConcat(curriedCapitalize('world'))).toBe('helloWORLD');
        });
    });
    describe('async curries', () => {
        const asyncUpper = async (a: string) => a.toUpperCase();
        it('can curry a function without binding any arguments', async () => {
            expect.assertions(1);
            const curriedUpper = curry(asyncUpper);
            await expect(curriedUpper('hello')).resolves.toBe('HELLO');
        });
        it('can curry a function and bind all arguments', async () => {
            expect.assertions(1);
            const curriedUpper = curry(asyncUpper, 'hello');
            await expect(curriedUpper()).resolves.toBe('HELLO');
        });
        it('can call the curried function multiple times', async () => {
            expect.assertions(3);
            const curriedUpper = curry(asyncUpper);
            await expect(curriedUpper('hello')).resolves.toBe('HELLO');
            await expect(curriedUpper('world')).resolves.toBe('WORLD');
            await expect(curriedUpper('again')).resolves.toBe('AGAIN');
        });
    });
});
