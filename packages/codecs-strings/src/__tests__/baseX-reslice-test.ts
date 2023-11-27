import { getBase16Encoder } from '../base16';
import { getBaseXResliceCodec } from '../baseX-reslice';

describe('getBaseXResliceCodec', () => {
    const base8 = getBaseXResliceCodec('01234567', 3);
    const b = (s: string) => getBase16Encoder().encode(s);

    it('can encode strings by reslicing bits', () => {
        // 8 times 3 bits gives us 3 bytes.
        expect(base8.encode('77777777')).toStrictEqual(b('ffffff'));
        expect(base8.read(b('ffffff'), 0)).toStrictEqual(['77777777', 3]);
        expect(base8.read(b('00ffffff'), 1)).toStrictEqual(['77777777', 4]);

        // Empty byte array.
        expect(base8.encode('')).toStrictEqual(b(''));
        expect(base8.read(b(''), 0)).toStrictEqual(['', 0]);
        expect(base8.read(b('ff'), 1)).toStrictEqual(['', 1]);

        // Single byte little-endian.
        expect(base8.encode('000')).toStrictEqual(b('00'));
        expect(base8.decode(b('00'))).toBe('000');
        expect(base8.encode('100')).toStrictEqual(b('20'));
        expect(base8.decode(b('20'))).toBe('100');
        expect(base8.encode('200')).toStrictEqual(b('40'));
        expect(base8.decode(b('40'))).toBe('200');
        expect(base8.encode('300')).toStrictEqual(b('60'));
        expect(base8.decode(b('60'))).toBe('300');
        expect(base8.encode('400')).toStrictEqual(b('80'));
        expect(base8.decode(b('80'))).toBe('400');
        expect(base8.encode('500')).toStrictEqual(b('a0'));
        expect(base8.decode(b('a0'))).toBe('500');
        expect(base8.encode('600')).toStrictEqual(b('c0'));
        expect(base8.decode(b('c0'))).toBe('600');
        expect(base8.encode('700')).toStrictEqual(b('e0'));
        expect(base8.decode(b('e0'))).toBe('700');

        // Single byte big-endian.
        expect(base8.encode('000')).toStrictEqual(b('00'));
        expect(base8.decode(b('00'))).toBe('000');
        expect(base8.encode('002')).toStrictEqual(b('01'));
        expect(base8.decode(b('01'))).toBe('002');
        expect(base8.encode('004')).toStrictEqual(b('02'));
        expect(base8.decode(b('02'))).toBe('004');
        expect(base8.encode('006')).toStrictEqual(b('03'));
        expect(base8.decode(b('03'))).toBe('006');
        expect(base8.encode('010')).toStrictEqual(b('04'));
        expect(base8.decode(b('04'))).toBe('010');
        expect(base8.encode('012')).toStrictEqual(b('05'));
        expect(base8.decode(b('05'))).toBe('012');
        expect(base8.encode('014')).toStrictEqual(b('06'));
        expect(base8.decode(b('06'))).toBe('014');
        expect(base8.encode('016')).toStrictEqual(b('07'));
        expect(base8.decode(b('07'))).toBe('016');
    });
});
