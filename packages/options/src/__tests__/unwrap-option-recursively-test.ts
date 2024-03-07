import { none, some } from '../option';
import { unwrapOptionRecursively } from '../unwrap-option-recursively';

describe('unwrapOptionRecursively', () => {
    it('can unwrap options recursively', () => {
        // Some.
        expect(unwrapOptionRecursively(some(null))).toBeNull();
        expect(unwrapOptionRecursively(some(42))).toBe(<number | null>42);
        expect(unwrapOptionRecursively(some('hello'))).toBe(<string | null>'hello');

        // None.
        expect(unwrapOptionRecursively(none())).toBeNull();
        expect(unwrapOptionRecursively(none<number>()) satisfies number | null).toBeNull();
        expect(unwrapOptionRecursively(none<string>()) satisfies string | null).toBeNull();

        // Nested Some and None.
        expect(unwrapOptionRecursively(some(some(some(false))))).toBe(<boolean | null>false);
        expect(unwrapOptionRecursively(some(some(none<42>()))) satisfies 42 | null).toBeNull();

        // Scalars.
        expect(unwrapOptionRecursively(1)).toBe(1);
        expect(unwrapOptionRecursively('hello')).toBe('hello');
        expect(unwrapOptionRecursively(true)).toBe(true);
        expect(unwrapOptionRecursively(false)).toBe(false);
        expect(unwrapOptionRecursively(null)).toBeNull();
        expect(unwrapOptionRecursively(undefined)).toBeUndefined();

        // TypedArrays.
        expect(unwrapOptionRecursively(new Uint8Array([1, 2, 3]))).toStrictEqual(new Uint8Array([1, 2, 3]));

        // Functions.
        const fn = () => 42;
        expect(unwrapOptionRecursively(fn)).toStrictEqual(fn);

        // Objects.
        expect(unwrapOptionRecursively({ foo: 'hello' })).toStrictEqual({ foo: 'hello' });
        expect(unwrapOptionRecursively({ foo: [1, true, '3'] })).toStrictEqual({ foo: [1, true, '3'] });
        expect(unwrapOptionRecursively({ foo: none<string>() })).toStrictEqual({ foo: null });
        expect(unwrapOptionRecursively({ foo: some(none<string>()) })).toStrictEqual({ foo: null });
        expect(unwrapOptionRecursively(some({ baz: none<number>(), foo: some('bar') }))).toStrictEqual(<
            { baz: number | null; foo: string | null } | null
        >{ baz: null, foo: 'bar' });

        // Arrays.
        expect(unwrapOptionRecursively([1, true, '3'])).toStrictEqual([1, true, '3']);
        expect(unwrapOptionRecursively([some('a'), none<boolean>(), some(some(3)), 'b'])).toStrictEqual([
            'a',
            null,
            3,
            'b',
        ]);
        expect(unwrapOptionRecursively([some('a'), none<boolean>(), some(some(3)), 'b'] as const)).toStrictEqual(<
            [string | null, boolean | null, number | null, string]
        >['a', null, 3, 'b']);

        // Combination.
        const person = {
            address: {
                city: 'Edmonton',
                country: 'Canada',
                phone: none<string>(),
                region: some('Alberta'),
                street: '11215 104 Ave NW',
                zipcode: 'T5K 2S1',
            },
            age: 42,
            gender: none<string>(),
            interests: [
                { category: some('IT'), name: 'Programming' },
                { category: some('Music'), name: 'Modular Synths' },
                { category: none<string>(), name: 'Popping bubble wrap' },
            ],
            name: 'Roo',
        };
        const unwrappedPerson = unwrapOptionRecursively(person);
        type ExpectedUnwrappedPerson = {
            address: {
                city: string;
                country: string;
                phone: string | null;
                region: string | null;
                street: string;
                zipcode: string;
            };
            age: number;
            gender: string | null;
            interests: Array<{ category: string | null; name: string }>;
            name: string;
        };
        expect(unwrappedPerson).toStrictEqual(<ExpectedUnwrappedPerson>{
            address: {
                city: 'Edmonton',
                country: 'Canada',
                phone: null,
                region: 'Alberta',
                street: '11215 104 Ave NW',
                zipcode: 'T5K 2S1',
            },
            age: 42,
            gender: null,
            interests: [
                { category: 'IT', name: 'Programming' },
                { category: 'Music', name: 'Modular Synths' },
                { category: null, name: 'Popping bubble wrap' },
            ],
            name: 'Roo',
        });
    });

    it('can unwrap options recursively whilst using a custom fallback', () => {
        const fallback = () => 42 as const;

        // Some.
        expect(unwrapOptionRecursively(some(null), fallback)).toBeNull();
        expect(unwrapOptionRecursively(some(100), fallback)).toBe(<number | 42>100);
        expect(unwrapOptionRecursively(some('hello'), fallback)).toBe(<string | 42>'hello');

        // None.
        expect(unwrapOptionRecursively(none(), fallback)).toBe(<unknown | 42>42);
        expect(unwrapOptionRecursively(none<number>(), fallback)).toBe(<number | 42>42);
        expect(unwrapOptionRecursively(none<string>(), fallback)).toBe(<string | 42>42);

        // Nested Some and None.
        expect(unwrapOptionRecursively(some(some(some(false))), fallback)).toBe(<boolean | 42>false);
        expect(unwrapOptionRecursively(some(some(none<100>())), fallback)).toBe(<42 | 100>42);

        // Combination.
        const person = {
            address: {
                city: 'Edmonton',
                country: 'Canada',
                phone: none<string>(),
                region: some('Alberta'),
                street: '11215 104 Ave NW',
                zipcode: 'T5K 2S1',
            },
            age: 42,
            gender: none<string>(),
            interests: [
                { category: some('IT'), name: 'Programming' },
                { category: some('Music'), name: 'Modular Synths' },
                { category: none<string>(), name: 'Popping bubble wrap' },
            ],
            name: 'Roo',
        };
        const unwrappedPerson = unwrapOptionRecursively(person, fallback);
        type ExpectedUnwrappedPerson = {
            address: {
                city: string;
                country: string;
                phone: string | 42;
                region: string | 42;
                street: string;
                zipcode: string;
            };
            age: number;
            gender: string | 42;
            interests: Array<{ category: string | 42; name: string }>;
            name: string;
        };
        expect(unwrappedPerson).toStrictEqual(<ExpectedUnwrappedPerson>{
            address: {
                city: 'Edmonton',
                country: 'Canada',
                phone: 42,
                region: 'Alberta',
                street: '11215 104 Ave NW',
                zipcode: 'T5K 2S1',
            },
            age: 42,
            gender: 42,
            interests: [
                { category: 'IT', name: 'Programming' },
                { category: 'Music', name: 'Modular Synths' },
                { category: 42, name: 'Popping bubble wrap' },
            ],
            name: 'Roo',
        });
    });
});
