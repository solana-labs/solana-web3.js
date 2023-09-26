import { curry } from '../curry';

function assertNotAProperty<T extends object, TPropName extends string>(
    _: { [Prop in keyof T]: Prop extends TPropName ? never : T[Prop] },
    _propName: TPropName
): void {}

// Primitives
{
    const fn = (a: string): string => a;
    const curried = curry(fn);
    curried satisfies (a: string) => string;
}
{
    const fn = (a: number): string => a.toString();
    const curried = curry(fn);
    curried satisfies (a: number) => string;
}
{
    const fn = (a: number, b: string): string => a.toString() + b;
    const curried = curry(fn);
    curried satisfies (a: number, b: string) => string;
}
{
    const fn = (a: number, b: string, c: boolean): string => a.toString() + b + c.toString();
    const curried = curry(fn);
    curried satisfies (a: number, b: string, c: boolean) => string;
}
{
    const fn = (a: number, b: string, c: boolean, d: number): string => a.toString() + b + c.toString() + d.toString();
    const curried = curry(fn);
    curried satisfies (a: number, b: string, c: boolean, d: number) => string;
}
{
    const fn = (a: number, b: string, c: boolean, d: number, e: string): string =>
        a.toString() + b + c.toString() + d.toString() + e;
    const curried = curry(fn);
    curried satisfies (a: number, b: string, c: boolean, d: number, e: string) => string;
}
{
    const fn = (a: number, b: string, c: boolean, d: number, e: string, f: boolean): string =>
        a.toString() + b + c.toString() + d.toString() + e + f.toString();
    const curried = curry(fn);
    curried satisfies (a: number, b: string, c: boolean, d: number, e: string, f: boolean) => string;
}
{
    const fn = (a: number, b: string, c: boolean, d: number, e: string, f: boolean, g: number): string =>
        a.toString() + b + c.toString() + d.toString() + e + f.toString() + g.toString();
    const curried = curry(fn);
    curried satisfies (a: number, b: string, c: boolean, d: number, e: string, f: boolean, g: number) => string;
}
{
    const fn = (a: number, b: string, c: boolean, d: number, e: string, f: boolean, g: number, h: string): string =>
        a.toString() + b + c.toString() + d.toString() + e + f.toString() + g.toString() + h;
    const curried = curry(fn);
    curried satisfies (
        a: number,
        b: string,
        c: boolean,
        d: number,
        e: string,
        f: boolean,
        g: number,
        h: string
    ) => string;
}
{
    const fn = (
        a: number,
        b: string,
        c: boolean,
        d: number,
        e: string,
        f: boolean,
        g: number,
        h: string,
        i: boolean
    ): string => a.toString() + b + c.toString() + d.toString() + e + f.toString() + g.toString() + h + i.toString();
    const curried = curry(fn);
    curried satisfies (
        a: number,
        b: string,
        c: boolean,
        d: number,
        e: string,
        f: boolean,
        g: number,
        h: string,
        i: boolean
    ) => string;
}

// Arrays
{
    const fn = (a: string[]): string => a.join('');
    const curried = curry(fn);
    curried satisfies (a: string[]) => string;
}
{
    const fn = (a: number[]): string => a.join('');
    const curried = curry(fn);
    curried satisfies (a: number[]) => string;
}
{
    const fn = (a: number[], b: number): number[] => a.map(x => x + b);
    const curried = curry(fn);
    curried satisfies (a: number[], b: number) => number[];
}
{
    const fn = (a: number[], b: string[]): string => a.join('') + b.join('');
    const curried = curry(fn);
    curried satisfies (a: number[], b: string[]) => string;
}

// Objects
{
    const fn = (a: { a: string }): string => a.a;
    const curried = curry(fn);
    curried satisfies (a: { a: string }) => string;
}
{
    const fn = (a: { a: number }): string => a.a.toString();
    const curried = curry(fn);
    curried satisfies (a: { a: number }) => string;
}
{
    const fn = (a: { a: number }, b: number): number => a.a + b;
    const curried = curry(fn);
    curried satisfies (a: { a: number }, b: number) => number;
}

// Functions that change objects to new objects
{
    const fn = (a: { a: number }): { a: string } => ({ a: a.a.toString() });
    const curried = curry(fn);
    curried satisfies (a: { a: number }) => { a: string };
}
{
    const fn = (a: { a: number }, b: { b: string }): { a: string; b: number } => ({
        a: a.a.toString(),
        b: parseInt(b.b, 10),
    });
    const curried = curry(fn);
    curried satisfies (a: { a: number }, b: { b: string }) => { a: string; b: number };
}

// Functions that combine objects
{
    const fn = (a: { a: number }, b: { b: string }): { a: number; b: string } => ({ ...a, ...b });
    const curried = curry(fn);
    curried satisfies (a: { a: number }, b: { b: string }) => { a: number; b: string };
}
{
    const fn = (a: { a: number }, b: { b: string }, c: { c: boolean }): { a: number; b: string; c: boolean } => ({
        ...a,
        ...b,
        ...c,
    });
    const curried = curry(fn);
    curried satisfies (a: { a: number }, b: { b: string }, c: { c: boolean }) => { a: number; b: string; c: boolean };
}

// Functions that append or create arrays on objects
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
{
    const fn = (a: { a: number }, b: string): { a: number; d: string[] } => addOrAppend(a, b);
    const curried = curry(fn);
    curried satisfies (a: { a: number }, b: string) => { a: number; d: string[] };
}
{
    const fn = (a: { a: number }, b: string, c: boolean): { a: number; d: string[]; c: boolean } => ({
        ...addOrAppend(a, b),
        c,
    });
    const curried = curry(fn);
    curried satisfies (a: { a: number }, b: string, c: boolean) => { a: number; d: string[]; c: boolean };
}
{
    const fn = (a: { a: number; d: string[] }): { a: number } => dropArray(a);
    const curried = curry(fn);
    curried satisfies (a: { a: number; d: string[] }) => { a: number };
    assertNotAProperty(curried.arguments, 'd');
}

// Nested curry
{
    const fn = (a: number, b: string): string => a.toString() + b;
    const curried = curry(fn);
    const curried2 = curry(curried);
    curried2 satisfies (a: number, b: string) => string;
}
{
    const fn = (a: number, b: string): string => a.toString() + b;
    const curried = curry(fn);
    const curried2 = curry(curried, 1);
    curried2 satisfies (b: string) => string;
}
{
    const fn = (a: number, b: string): string => a.toString() + b;
    const curried = curry(fn);
    const curried2 = curry(curried, 1, 'hello');
    curried2 satisfies () => string;
}
