import { pipe } from '../pipe';

function assertNotAProperty<T extends object, TPropName extends string>(
    _: { [Prop in keyof T]: Prop extends TPropName ? never : T[Prop] },
    _propName: TPropName,
): void {}

// Single-value primitives
{
    const value = pipe(true);
    value satisfies boolean;
}
{
    const value = pipe('test');
    value satisfies string;
}
{
    const value = pipe(1);
    value satisfies number;
}
{
    const value = pipe(3n);
    value satisfies bigint;
}
{
    const value = pipe(null);
    value satisfies null;
}
{
    const value = pipe(undefined);
    value satisfies undefined;
}

// Single-value objects
{
    const value = pipe({});
    value satisfies Record<never, never>;
}
{
    const value = pipe({ a: 1 });
    value satisfies { a: number };
}
{
    const value = pipe({ a: 1, b: 'test' });
    value satisfies { a: number; b: string };
}
{
    const value = pipe({ a: 1, b: 'test', c: true });
    value satisfies { a: number; b: string; c: boolean };
}

// Single-value arrays
{
    const value = pipe([]);
    value satisfies never[];
}
{
    // TypeScript will infer this as an array
    const value = pipe([1]);
    value satisfies number[];
}
{
    // TypeScript will infer this as an array
    const value = pipe([1, 'test']);
    value satisfies (number | string)[];
}
{
    // TypeScript will infer this as an array
    const value = pipe([1, 'test', true]);
    value satisfies (boolean | number | string)[];
}

// Single-value tuples
{
    const value = pipe([1] as [number]);
    value satisfies [number];
}
{
    const value = pipe([1, 'test'] as [number, string]);
    value satisfies [number, string];
}
{
    const value = pipe([1, 'test', true] as [number, string, boolean]);
    value satisfies [number, string, boolean];
}

// Functions that operate on primitives
{
    const value = pipe(true, value => !value);
    value satisfies boolean;
}
{
    const value = pipe('test', value => value.toUpperCase());
    value satisfies string;
}
{
    const value = pipe(1, value => value + 1);
    value satisfies number;
}
{
    const value = pipe(3n, value => value + 1n);
    value satisfies bigint;
}
{
    const value = pipe(null, value => value);
    value satisfies null;
}
{
    const value = pipe(undefined, value => value);
    value satisfies undefined;
}

// Functions that change primitives to new types
{
    const value = pipe(1, value => value.toString());
    value satisfies string;
}
{
    const value = pipe('test', value => value.length);
    value satisfies number;
}
{
    const value = pipe(
        1,
        value => value.toString(),
        value => value + '!',
    );
    value satisfies string;
}
{
    const value = pipe(
        'test',
        value => value.length,
        value => value + 1,
    );
    value satisfies number;
}

// Functions that operate on objects
{
    const value = pipe({}, value => value);
    value satisfies Record<never, never>;
}
{
    const value = pipe({ a: 1 }, value => value);
    value satisfies { a: number };
}
{
    const value = pipe({ a: 1, b: 'test' }, value => value);
    value satisfies { a: number; b: string };
}
{
    const value = pipe({ a: 1, b: 'test', c: true }, value => value);
    value satisfies { a: number; b: string; c: boolean };
}

// Functions that change objects to new types
{
    const value = pipe({ a: 1 }, value => value.a);
    value satisfies number;
}
{
    const value = pipe({ a: 1 }, value => value.a.toString());
    value satisfies string;
}
{
    const value = pipe(
        { a: 1 },
        value => value.a,
        value => value + 1,
    );
    value satisfies number;
}
{
    const value = pipe(
        { a: 1 },
        value => value.a.toString(),
        value => value + '!',
    );
    value satisfies string;
}

// Functions that change objects to new objects
{
    const value = pipe({ a: 1 }, value => ({ b: value.a }));
    value satisfies { b: number };
}
{
    const value = pipe({ a: 1 }, value => ({ b: value.a.toString() }));
    value satisfies { b: string };
}
{
    const value = pipe(
        { a: 1 },
        value => ({ b: value.a }),
        value => ({ c: value.b }),
    );
    value satisfies { c: number };
}
{
    const value = pipe(
        { a: 1 },
        value => ({ b: value.a.toString() }),
        value => ({ c: value.b }),
    );
    value satisfies { c: string };
}

// Functions that combine objects
{
    const value = pipe({ a: 1 }, value => ({ ...value, b: 2 }));
    value satisfies { a: number; b: number };
}
{
    const value = pipe({ a: 1 }, value => ({ ...value, b: 'test' }));
    value satisfies { a: number; b: string };
}
{
    const value = pipe(
        { a: 1 },
        value => ({ ...value, b: 2 }),
        value => ({ ...value, c: true }),
    );
    value satisfies { a: number; b: number; c: boolean };
}
{
    const value = pipe(
        { a: 1 },
        value => ({ ...value, b: 'test' }),
        value => ({ ...value, c: true }),
    );
    value satisfies { a: number; b: string; c: boolean };
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
    const value = pipe(
        { a: 1 },
        value => ({ ...value, b: 'test' }),
        value => ({ ...value, c: true }),
        value => addOrAppend(value, 'test'),
    );
    value satisfies { a: number; b?: string; c?: boolean; d: string[] };
}
{
    const value = pipe(
        { a: 1 },
        value => ({ ...value, b: 'test' }),
        value => ({ ...value, c: true }),
        value => addOrAppend(value, 'test'),
        value => addOrAppend(value, 'test again'),
        value => addOrAppend(value, 'test a third time'),
    );
    value satisfies { a: number; b?: string; c?: boolean; d: string[] };
}
{
    const value = pipe(
        { a: 1 },
        value => addOrAppend(value, 'test'),
        value => ({ ...value, b: 'test' }),
        value => ({ ...value, c: true }),
    );
    value satisfies { a: number; b?: string; c?: boolean; d: string[] };
}
{
    const value = pipe(
        { a: 1 },
        value => addOrAppend(value, 'test'),
        value => addOrAppend(value, 'test again'),
        value => ({ ...value, b: 'test' }),
        value => ({ ...value, c: true }),
        value => dropArray(value),
    );
    value satisfies { a: number; b?: string; c?: boolean };
    assertNotAProperty(value, 'd');
}

// Nested pipes
{
    const value = pipe(
        { a: 1 },
        value => ({ ...value, b: 'test' }),
        value => ({ ...value, c: true }),
        value => ({ ...value, d: pipe({}, value => ({ ...value, e: 1 })) }),
    );
    value satisfies { a: number; b?: string; c?: boolean; d: { e: number } };
}
{
    const value = pipe(
        { a: 1 },
        value => ({ ...value, b: 'test' }),
        value => ({ ...value, c: true }),
        value => ({ ...value, d: pipe({}, value => ({ ...value, e: 1 })) }),
        value => ({ ...value, d: pipe(value.d, value => ({ ...value, f: 'test' })) }),
    );
    value satisfies { a: number; b?: string; c?: boolean; d: { e: number; f: string } };
}
