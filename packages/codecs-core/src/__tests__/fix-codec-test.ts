/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Codec } from '../codec';
import { fixCodec } from '../fixCodec';
import { a1z26, base16 } from './_setup';

describe('fixCodec', () => {
    it('can fix a codec to a given amount of bytes', () => {
        const b = (s: string) => base16.encode(s);
        const s = (size: number) => fixCodec(a1z26, size);

        // Description matches the fixed definition.
        expect(fixCodec(a1z26, 42).description).toBe('fixed(42, a1z26)');

        // Description can be overridden.
        expect(fixCodec(a1z26, 42, 'my fixed').description).toBe('my fixed');

        // Fixed and max sizes.
        expect(fixCodec(a1z26, 12).fixedSize).toBe(12);
        expect(fixCodec(a1z26, 12).maxSize).toBe(12);
        expect(fixCodec(a1z26, 42).fixedSize).toBe(42);
        expect(fixCodec(a1z26, 42).maxSize).toBe(42);

        // Buffer size === fixed size.
        expect(s(10).encode('helloworld')).toStrictEqual(b('08050c0c0f170f120c04'));
        expect(s(10).decode(b('08050c0c0f170f120c04'))).toStrictEqual(['helloworld', 10]);

        // Buffer size > fixed size => truncated.
        expect(s(5).encode('helloworld')).toStrictEqual(b('08050c0c0f'));
        expect(s(5).decode(b('08050c0c0f170f120c04'))).toStrictEqual(['hello', 5]);

        // Buffer size < fixed size => padded.
        expect(s(10).encode('hello')).toStrictEqual(b('08050c0c0f0000000000'));
        expect(s(10).decode(b('08050c0c0f0000000000'))).toStrictEqual(['hello_____', 10]);
        expect(() => s(10).decode(b('08050c0c0f'))).toThrow('Codec [fixCodec] expected 10 bytes, got 5.');
    });

    it('can fix a codec that requires a minimum amount of bytes', () => {
        // Given a mock `u32` codec that ensures the buffer is 4 bytes long.
        const u32: Codec<number> = {
            description: 'u32',
            fixedSize: 4,
            maxSize: 4,
            encode: (value: number) => new Uint8Array([value, 0, 0, 0]),
            decode(bytes, offset = 0): [number, number] {
                // eslint-disable-next-line jest/no-conditional-in-test
                if (bytes.slice(offset).length < offset + 4) {
                    throw new Error('Not enough bytes to decode a u32.');
                }
                return [bytes.slice(offset)[0], offset + 4];
            },
        };

        // When we synthesize a `u24` from that `u32` using `fixCodec`.
        const u24 = fixCodec(u32, 3);

        // Then we can encode a `u24`.
        const buf = u24.encode(42);
        expect(buf).toStrictEqual(new Uint8Array([42, 0, 0]));

        // And we can decode it back.
        const hydrated = u24.decode(buf);
        expect(hydrated).toStrictEqual([42, 3]);
    });
});
