/* eslint-disable sort-keys-fix/sort-keys-fix */
import { fixCodec } from '../fixCodec';
import { reverseCodec } from '../reverseCodec';
import { base16 } from './__setup__';

describe('reverseCodec', () => {
    it('can reverse the bytes of a fixed-size codec', () => {
        const b = (s: string) => base16.encode(s);
        const s = (size: number) => reverseCodec(fixCodec(base16, size));

        // Encode.
        expect(s(1).encode('00')).toStrictEqual(b('00'));
        expect(s(2).encode('00ff')).toStrictEqual(b('ff00'));
        expect(s(2).encode('ff00')).toStrictEqual(b('00ff'));
        expect(s(4).encode('00000001')).toStrictEqual(b('01000000'));
        expect(s(4).encode('01000000')).toStrictEqual(b('00000001'));
        expect(s(8).encode('0000000000000001')).toStrictEqual(b('0100000000000000'));
        expect(s(8).encode('0100000000000000')).toStrictEqual(b('0000000000000001'));
        expect(s(32).encode(`01${'00'.repeat(31)}`)).toStrictEqual(b(`${'00'.repeat(31)}01`));
        expect(s(32).encode(`${'00'.repeat(31)}01`)).toStrictEqual(b(`01${'00'.repeat(31)}`));

        // Decode.
        expect(s(2).decode(b('ff00'))).toStrictEqual(['00ff', 2]);
        expect(s(2).decode(b('00ff'))).toStrictEqual(['ff00', 2]);
        expect(s(4).decode(b('00000001'))).toStrictEqual(['01000000', 4]);
        expect(s(4).decode(b('01000000'))).toStrictEqual(['00000001', 4]);
        expect(s(4).decode(b('aaaa01000000bbbb'), 2)).toStrictEqual(['00000001', 6]);
        expect(s(4).decode(b('aaaa00000001bbbb'), 2)).toStrictEqual(['01000000', 6]);

        // Variable-size codec.
        expect(() => reverseCodec(base16)).toThrow('Cannot reverse a codec of variable size');
    });
});
