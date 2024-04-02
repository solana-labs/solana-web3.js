import { Endian } from '../common';
import { getF32Codec } from '../f32';
import { assertValid } from './__setup__';

const APPROX_PI = 3.1415927410125732;
const f32 = getF32Codec;

describe('getF32Codec', () => {
    it('encodes and decodes f32 numbers', () => {
        expect.hasAssertions();
        const f32LE = f32();
        const f32BE = f32({ endian: Endian.Big });

        assertValid(f32LE, 0, '00000000');
        assertValid(f32BE, 0, '00000000');

        assertValid(f32LE, 1, '0000803f');
        assertValid(f32BE, 1, '3f800000');
        assertValid(f32LE, 42, '00002842');
        assertValid(f32BE, 42, '42280000');
        assertValid(f32LE, Math.PI, 'db0f4940', APPROX_PI);
        assertValid(f32BE, Math.PI, '40490fdb', APPROX_PI);

        assertValid(f32LE, -1, '000080bf');
        assertValid(f32BE, -1, 'bf800000');
        assertValid(f32LE, -42, '000028c2');
        assertValid(f32BE, -42, 'c2280000');
        assertValid(f32LE, -Math.PI, 'db0f49c0', -APPROX_PI);
        assertValid(f32BE, -Math.PI, 'c0490fdb', -APPROX_PI);
    });

    it('has the right size', () => {
        expect(f32().fixedSize).toBe(4);
    });
});
