import { getUnitCodec } from '../unit';
import { b } from './__setup__';

describe('getUnitCodec', () => {
    const unit = getUnitCodec;

    it('encodes void', () => {
        // Encode.
        expect(unit().encode(undefined)).toStrictEqual(b(''));
        expect(unit().encode(void 0)).toStrictEqual(b(''));

        // Decode.
        expect(unit().decode(b(''))).toStrictEqual([undefined, 0]);
        expect(unit().decode(b('00'))).toStrictEqual([undefined, 0]);
        expect(unit().decode(b('00'), 1)).toStrictEqual([undefined, 1]);
    });

    it('has the right description', () => {
        expect(unit().description).toBe('unit');
        expect(unit({ description: 'My Unit' }).description).toBe('My Unit');
    });

    it('has the right sizes', () => {
        expect(unit().fixedSize).toBe(0);
        expect(unit().maxSize).toBe(0);
    });
});
