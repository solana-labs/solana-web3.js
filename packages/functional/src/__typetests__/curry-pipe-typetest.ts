import { curry } from '../curry';
import { pipe } from '../pipe';

{
    const add = (a: number, b: number) => a + b;
    const addOne = curry(add, 1);
    pipe(1, addOne, addOne) satisfies number;
}
{
    const add = (a: number, b: number) => a + b;
    const addOne = curry(add, 1);
    const addTwo = curry(add, 2);
    pipe(1, addOne, addTwo) satisfies number;
}
{
    const add = (a: number, b: number) => a + b;
    const addOne = curry(add, 1);
    const addTwo = curry(add, 2);
    pipe(pipe(1, addOne, addTwo), addOne, addTwo) satisfies number;
}
{
    const add = (a: number, b: number) => a + b;
    const addOne = curry(add, 1);
    const addTwo = curry(add, 2);
    const pipedAdd = (startNumber: number) => pipe(startNumber, addOne, addTwo);
    const curriedPipedAdd = curry(pipedAdd);
    curriedPipedAdd(1) satisfies number;
}
