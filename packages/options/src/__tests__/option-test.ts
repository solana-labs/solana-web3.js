import { isNone, isSome, none, Option, some } from '../option';

describe('Option', () => {
    it('can create Some and None options', () => {
        const optionA: Option<number> = some(42);
        expect(optionA).toStrictEqual({ __option: 'Some', value: 42 });

        const optionB: Option<null> = some(null);
        expect(optionB).toStrictEqual({ __option: 'Some', value: null });

        const optionC: Option<unknown> = none();
        expect(optionC).toStrictEqual({ __option: 'None' });

        const optionD: Option<string> = none<string>();
        expect(optionD).toStrictEqual({ __option: 'None' });
    });

    it('can check if an option is Some or None', () => {
        const optionA = some(42);
        expect(isSome(optionA)).toBe(true);
        expect(isNone(optionA)).toBe(false);

        const optionB = none<number>();
        expect(isSome(optionB)).toBe(false);
        expect(isNone(optionB)).toBe(true);
    });
});
