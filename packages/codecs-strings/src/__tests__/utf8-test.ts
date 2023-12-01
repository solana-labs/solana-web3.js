import { getUtf8Codec } from '../utf8';

describe('getUtf8Codec', () => {
    it('can encode UTF-8 strings', () => {
        const utf8 = getUtf8Codec();

        expect(utf8.encode('')).toStrictEqual(new Uint8Array([]));
        expect(utf8.decode(new Uint8Array([]))).toBe('');

        expect(utf8.encode('0')).toStrictEqual(new Uint8Array([48]));
        expect(utf8.decode(new Uint8Array([48]))).toBe('0');

        expect(utf8.encode('ABC')).toStrictEqual(new Uint8Array([65, 66, 67]));
        expect(utf8.decode(new Uint8Array([65, 66, 67]))).toBe('ABC');

        const encodedHelloWorld = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]);
        expect(utf8.encode('Hello World!')).toStrictEqual(encodedHelloWorld);
        expect(utf8.decode(encodedHelloWorld)).toBe('Hello World!');

        expect(utf8.encode('語')).toStrictEqual(new Uint8Array([232, 170, 158]));
        expect(utf8.decode(new Uint8Array([232, 170, 158]))).toBe('語');
    });
});
