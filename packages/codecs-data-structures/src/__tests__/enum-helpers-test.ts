import {
    formatNumericalValues,
    getEnumIndexFromDiscriminator,
    getEnumIndexFromVariant,
    getEnumStats,
} from '../enum-helpers';

describe('getEnumStats', () => {
    it('handles sequential numerical enums', () => {
        enum Feedback {
            Bad,
            Good,
        }
        expect(getEnumStats(Feedback)).toStrictEqual({
            enumKeys: ['Bad', 'Good'],
            enumRecord: { Bad: 0, Good: 1 },
            enumValues: [0, 1],
            numericalValues: [0, 1],
            stringValues: ['Bad', 'Good'],
        });
    });

    it('handles explicit numerical enums', () => {
        enum Prime {
            Two = 2,
            Three,
            Five = 5,
        }
        expect(getEnumStats(Prime)).toStrictEqual({
            enumKeys: ['Two', 'Three', 'Five'],
            enumRecord: { Five: 5, Three: 3, Two: 2 },
            enumValues: [2, 3, 5],
            numericalValues: [2, 3, 5],
            stringValues: ['Two', 'Three', 'Five'],
        });
    });

    it('handles conflicting numerical enums', () => {
        enum FortyTwo {
            One = 42,
            // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
            Two = 42,
        }
        expect(getEnumStats(FortyTwo)).toStrictEqual({
            enumKeys: ['One', 'Two'],
            enumRecord: { One: 42, Two: 42 },
            enumValues: [42, 42],
            numericalValues: [42],
            stringValues: ['One', 'Two'],
        });
    });

    it('handles lexical enums', () => {
        enum Direction {
            Up = '↑',
            Down = '↓',
            Left = '←',
            Right = '→',
        }
        expect(getEnumStats(Direction)).toStrictEqual({
            enumKeys: ['Up', 'Down', 'Left', 'Right'],
            enumRecord: { Down: '↓', Left: '←', Right: '→', Up: '↑' },
            enumValues: ['↑', '↓', '←', '→'],
            numericalValues: [],
            stringValues: ['Up', 'Down', 'Left', 'Right', '↑', '↓', '←', '→'],
        });
    });

    it('handles hybrid enums', () => {
        enum Hybrid {
            Zero,
            One,
            Five = 5,
            Six,
            Seven = 'nana',
            Nine = 9,
            // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
            NineAgain = 9,
        }
        expect(getEnumStats(Hybrid)).toStrictEqual({
            enumKeys: ['Zero', 'One', 'Five', 'Six', 'Seven', 'Nine', 'NineAgain'],
            enumRecord: { Five: 5, Nine: 9, NineAgain: 9, One: 1, Seven: 'nana', Six: 6, Zero: 0 },
            enumValues: [0, 1, 5, 6, 'nana', 9, 9],
            numericalValues: [0, 1, 5, 6, 9],
            stringValues: ['Zero', 'One', 'Five', 'Six', 'Seven', 'Nine', 'NineAgain', 'nana'],
        });
    });
});

describe('getEnumIndexFromVariant', () => {
    it('get indices from enum values', () => {
        enum Numbers {
            One,
            Two = 'two',
            Three = 3,
        }
        const stats = getEnumStats(Numbers);
        expect(getEnumIndexFromVariant({ ...stats, variant: Numbers.One })).toBe(0);
        expect(getEnumIndexFromVariant({ ...stats, variant: Numbers.Two })).toBe(1);
        expect(getEnumIndexFromVariant({ ...stats, variant: Numbers.Three })).toBe(2);
    });

    it('get indices from enum keys', () => {
        enum Numbers {
            One,
            Two = 'two',
            Three = 3,
        }
        const stats = getEnumStats(Numbers);
        expect(getEnumIndexFromVariant({ ...stats, variant: 'One' })).toBe(0);
        expect(getEnumIndexFromVariant({ ...stats, variant: 'Two' })).toBe(1);
        expect(getEnumIndexFromVariant({ ...stats, variant: 'Three' })).toBe(2);
    });

    it('prioritizes indices from values', () => {
        enum CrossedValues {
            A = 'B',
            B = 'A',
        }
        const stats = getEnumStats(CrossedValues);
        expect(getEnumIndexFromVariant({ ...stats, variant: 'A' })).toBe(1);
        expect(getEnumIndexFromVariant({ ...stats, variant: 'B' })).toBe(0);
    });

    it('uses the last index when duplicated numerical values are provided', () => {
        enum Duplicates {
            A = 42,
            // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
            B = 42,
        }
        const stats = getEnumStats(Duplicates);
        expect(getEnumIndexFromVariant({ ...stats, variant: 42 })).toBe(1);
    });

    it('uses the last index when duplicated lexical values are provided', () => {
        enum Duplicates {
            A = 'FortyTwo',
            // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
            B = 'FortyTwo',
        }
        const stats = getEnumStats(Duplicates);
        expect(getEnumIndexFromVariant({ ...stats, variant: 'FortyTwo' })).toBe(1);
    });
});

describe('getEnumIndexFromDiscriminator', () => {
    it('returns the discriminant as the index', () => {
        enum Numbers {
            One,
            Two = 'two',
            Three = 3,
        }
        const configs = { ...getEnumStats(Numbers), useValuesAsDiscriminators: false };
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 0 })).toBe(0);
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 1 })).toBe(1);
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 2 })).toBe(2);
    });

    it('returns -1 if the discriminant is out of range', () => {
        enum Numbers {
            One,
            Two,
        }
        const configs = { ...getEnumStats(Numbers), useValuesAsDiscriminators: false };
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: -1 })).toBe(-1);
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 2 })).toBe(-1);
    });

    it('returns the numerical value as the index if useValuesAsDiscriminators is true', () => {
        enum Numbers {
            Zero,
            One,
            Five = 5,
            Six,
            Nine = 9,
        }
        const configs = { ...getEnumStats(Numbers), useValuesAsDiscriminators: true };
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 0 })).toBe(0);
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 1 })).toBe(1);
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 5 })).toBe(2);
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 6 })).toBe(3);
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 9 })).toBe(4);
    });

    it('returns -1 if the discriminant is not a value and useValuesAsDiscriminators is true', () => {
        enum Numbers {
            Zero,
            One,
            Five = 5,
            Six,
            Nine = 'nine',
        }
        const configs = { ...getEnumStats(Numbers), useValuesAsDiscriminators: true };
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: -1 })).toBe(-1);
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 2 })).toBe(-1);
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 3 })).toBe(-1);
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 4 })).toBe(-1);
        expect(getEnumIndexFromDiscriminator({ ...configs, discriminator: 9 })).toBe(-1);
    });
});

describe('formatNumericalValues', () => {
    it('formats an empty array to an empty string', () => {
        expect(formatNumericalValues([])).toBe('');
    });

    it('formats a single value', () => {
        expect(formatNumericalValues([1])).toBe('1');
    });

    it('formats a single range', () => {
        expect(formatNumericalValues([4, 5, 6, 7, 8])).toBe('4-8');
    });

    it('formats non-consecutive numbers', () => {
        expect(formatNumericalValues([3, 5, 7, 11, 13])).toBe('3, 5, 7, 11, 13');
    });

    it('formats a mixture of ranges and non-consecutive numbers', () => {
        expect(formatNumericalValues([1, 2, 3, 5, 12, 13, 14, 15, 42, 89, 90, 100])).toBe(
            '1-3, 5, 12-15, 42, 89-90, 100',
        );
    });
});
