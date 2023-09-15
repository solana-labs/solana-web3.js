import { pipe } from '../pipe';

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
    value satisfies (number | string | boolean)[];
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
        value => value + '!'
    );
    value satisfies string;
}
{
    const value = pipe(
        'test',
        value => value.length,
        value => value + 1
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
        value => value + 1
    );
    value satisfies number;
}
{
    const value = pipe(
        { a: 1 },
        value => value.a.toString(),
        value => value + '!'
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
        value => ({ c: value.b })
    );
    value satisfies { c: number };
}
{
    const value = pipe(
        { a: 1 },
        value => ({ b: value.a.toString() }),
        value => ({ c: value.b })
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
        value => ({ ...value, c: true })
    );
    value satisfies { a: number; b: number; c: boolean };
}
{
    const value = pipe(
        { a: 1 },
        value => ({ ...value, b: 'test' }),
        value => ({ ...value, c: true })
    );
    value satisfies { a: number; b: string; c: boolean };
}
