import { curry } from '../curry';
import { pipe } from '../pipe';

describe('curry and pipe', () => {
    it('can build a pipe with curried functions', () => {
        const add = (a: number, b: number) => a + b;
        const addOne = curry(add, 1);
        expect(pipe(1, addOne, addOne)).toBe(3);
    });
    it('can pipe multiple different curried functions', () => {
        const add = (a: number, b: number) => a + b;
        const addOne = curry(add, 1);
        const addTwo = curry(add, 2);
        expect(pipe(1, addOne, addTwo)).toBe(4);
    });
    it('can build a nested pipe with curried functions', () => {
        const add = (a: number, b: number) => a + b;
        const addOne = curry(add, 1);
        const addTwo = curry(add, 2);
        expect(pipe(pipe(1, addOne, addTwo), addOne, addTwo)).toBe(7);
    });
    it('can curry a pipe', () => {
        const add = (a: number, b: number) => a + b;
        const addOne = curry(add, 1);
        const addTwo = curry(add, 2);
        const pipedAdd = (startNumber: number) => pipe(startNumber, addOne, addTwo);
        const curriedPipedAdd = curry(pipedAdd);
        expect(curriedPipedAdd(1)).toBe(4);
    });
});
