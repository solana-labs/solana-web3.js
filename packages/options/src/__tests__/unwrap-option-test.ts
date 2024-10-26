import { none, some } from '../option';
import { unwrapOption, wrapNullable } from '../unwrap-option';

describe('unwrapOption', () => {
    it('can unwrap an Option as a Nullable', () => {
        expect(unwrapOption(some(42))).toBe(42);
        expect(unwrapOption(some(null))).toBeNull();
        expect(unwrapOption(some('hello'))).toBe('hello');
        expect(unwrapOption(none())).toBeNull();
        expect(unwrapOption(none<number>())).toBeNull();
        expect(unwrapOption(none<string>())).toBeNull();
    });

    it('can unwrap an Option using a fallback callback', () => {
        const fallbackA = () => 42 as const;
        expect(unwrapOption(some(1), fallbackA)).toBe(1 satisfies number);
        expect(unwrapOption(some('A'), fallbackA)).toBe('A' satisfies string | 42);
        expect(unwrapOption(none(), fallbackA)).toBe(42 satisfies unknown);

        const fallbackB = () => {
            throw new Error('Fallback Error');
        };
        expect(unwrapOption(some(1), fallbackB)).toBe(1);
        expect(unwrapOption(some('A'), fallbackB)).toBe('A');
        expect(() => unwrapOption(none(), fallbackB)).toThrow('Fallback Error');
    });

    it('can wrap a Nullable as an Option', () => {
        expect(wrapNullable(42)).toStrictEqual(some(42));
        expect(wrapNullable('hello')).toStrictEqual(some('hello'));
        expect(wrapNullable(false)).toStrictEqual(some(false));
        expect(wrapNullable(undefined)).toStrictEqual(some(undefined));
        expect(wrapNullable<string>(null)).toStrictEqual(none<string>());
        expect(wrapNullable<number>(null)).toStrictEqual(none<number>());
    });
});
